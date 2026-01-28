import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

// テスト用のNext.js API Routeハンドラーをインポート
import { GET, POST } from "@/app/api/tastings/route";
import { GET as GET_BY_ID, PUT, DELETE } from "@/app/api/tastings/[id]/route";

// NextRequestのモック作成ヘルパー
function createRequest(
  method: string,
  body?: object,
  url: string = "http://localhost:3000/api/tastings",
): Request {
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request(url, init);
}

// コンテキスト（paramsを含む）のモック作成ヘルパー
function createContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("TastingEntry API", () => {
  // テスト用のコーヒー豆ID
  let testBeanId: number;
  let finishedBeanId: number;
  let testDripperId: number;
  let testFilterId: number;

  // 各テスト前にDBをクリーンアップしてテストデータを作成
  beforeEach(async () => {
    await prisma.tastingNote.deleteMany();
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();
    await prisma.dripper.deleteMany();
    await prisma.filter.deleteMany();

    // テスト用の豆を作成（在庫中）
    const bean = await prisma.coffeeBean.create({
      data: { name: "テスト豆", status: "IN_STOCK" },
    });
    testBeanId = bean.id;

    // テスト用の豆を作成（飲み切り）
    const finishedBean = await prisma.coffeeBean.create({
      data: { name: "飲み切り豆", status: "FINISHED" },
    });
    finishedBeanId = finishedBean.id;

    // テスト用のドリッパーを作成
    const dripper = await prisma.dripper.create({
      data: { name: "テストドリッパー" },
    });
    testDripperId = dripper.id;

    // テスト用のフィルターを作成
    const filter = await prisma.filter.create({
      data: { name: "テストフィルター", type: "PAPER" },
    });
    testFilterId = filter.id;
  });

  // テスト後もクリーンアップ
  afterEach(async () => {
    await prisma.tastingNote.deleteMany();
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();
    await prisma.dripper.deleteMany();
    await prisma.filter.deleteMany();
  });

  describe("GET /api/tastings", () => {
    it("空の配列を返す（試飲記録が存在しない場合）", async () => {
      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("全ての試飲記録を返す", async () => {
      // テストデータを作成
      await prisma.tastingEntry.createMany({
        data: [
          { coffeeBeanId: testBeanId, brewDate: new Date("2026-01-20") },
          { coffeeBeanId: testBeanId, brewDate: new Date("2026-01-21") },
        ],
      });

      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it("豆IDでフィルタリングできる", async () => {
      // 別の豆を作成
      const anotherBean = await prisma.coffeeBean.create({
        data: { name: "別の豆" },
      });

      // テストデータを作成
      await prisma.tastingEntry.createMany({
        data: [
          { coffeeBeanId: testBeanId, brewDate: new Date("2026-01-20") },
          { coffeeBeanId: anotherBean.id, brewDate: new Date("2026-01-21") },
        ],
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/tastings?coffeeBeanId=${testBeanId}`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].coffeeBeanId).toBe(testBeanId);
    });

    it("関連する豆・ドリッパー・フィルター情報を含めて返す", async () => {
      await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          dripperId: testDripperId,
          filterId: testFilterId,
          brewDate: new Date(),
        },
      });

      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].coffeeBean).toBeDefined();
      expect(data[0].coffeeBean.name).toBe("テスト豆");
      expect(data[0].dripper).toBeDefined();
      expect(data[0].dripper.name).toBe("テストドリッパー");
      expect(data[0].filter).toBeDefined();
      expect(data[0].filter.name).toBe("テストフィルター");
    });

    it("テイスティングノートの平均評価を含めて返す", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      // テイスティングノートを追加
      await prisma.tastingNote.createMany({
        data: [
          {
            tastingEntryId: tasting.id,
            recordedBy: "田中",
            overallRating: 4,
            acidity: 3,
            bitterness: 2,
          },
          {
            tastingEntryId: tasting.id,
            recordedBy: "鈴木",
            overallRating: 5,
            acidity: 5,
            bitterness: 4,
          },
        ],
      });

      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].averageRating).toBeDefined();
      expect(data[0].averageRating.overall).toBe(4.5); // (4+5)/2
      expect(data[0].averageRating.acidity).toBe(4); // (3+5)/2
      expect(data[0].averageRating.bitterness).toBe(3); // (2+4)/2
      expect(data[0].noteCount).toBe(2);
    });

    it("テイスティングノートがない場合、平均評価はnull", async () => {
      await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].averageRating).toBeNull();
      expect(data[0].noteCount).toBe(0);
    });
  });

  describe("POST /api/tastings", () => {
    it("新しいドリップ記録を作成する（抽出情報のみ）", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        grindSize: 5.5,
        brewedBy: "山田",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.coffeeBeanId).toBe(testBeanId);
      expect(data.grindSize).toBe(5.5);
      expect(data.brewedBy).toBe("山田");
      expect(data.id).toBeDefined();
    });

    it("豆IDと抽出日のみで作成できる（任意フィールドは省略可）", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.coffeeBeanId).toBe(testBeanId);
      expect(data.grindSize).toBeNull();
    });

    it("ドリッパーとフィルターを紐づけて作成できる", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        dripperId: testDripperId,
        filterId: testFilterId,
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.dripperId).toBe(testDripperId);
      expect(data.filterId).toBe(testFilterId);
    });

    it("画像パスを含めて作成できる", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        imagePath: "/images/tastings/test-image.jpg",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imagePath).toBe("/images/tastings/test-image.jpg");
    });

    it("豆IDがない場合は400エラー", async () => {
      const tastingData = { brewDate: "2026-01-25" };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("抽出日がない場合は400エラー", async () => {
      const tastingData = { coffeeBeanId: testBeanId };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("存在しない豆IDの場合は400エラー", async () => {
      const tastingData = {
        coffeeBeanId: 99999,
        brewDate: "2026-01-25",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("飲み切りステータスの豆は選択不可（400エラー）", async () => {
      const tastingData = {
        coffeeBeanId: finishedBeanId,
        brewDate: "2026-01-25",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("在庫中");
    });
  });

  describe("GET /api/tastings/[id]", () => {
    it("指定したIDのドリップ記録を返す", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
          grindSize: 5.0,
        },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await GET_BY_ID(
        request,
        createContext(String(tasting.id)),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(tasting.id);
      expect(data.grindSize).toBe(5.0);
      expect(data.coffeeBean).toBeDefined();
    });

    it("テイスティングノートを含めて返す", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      await prisma.tastingNote.create({
        data: {
          tastingEntryId: tasting.id,
          recordedBy: "田中",
          overallRating: 4,
        },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await GET_BY_ID(
        request,
        createContext(String(tasting.id)),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tastingNotes).toBeDefined();
      expect(data.tastingNotes).toHaveLength(1);
      expect(data.tastingNotes[0].recordedBy).toBe("田中");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/tastings/99999",
      );
      const response = await GET_BY_ID(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("無効なIDの場合は400エラー", async () => {
      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/tastings/invalid",
      );
      const response = await GET_BY_ID(request, createContext("invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("PUT /api/tastings/[id]", () => {
    it("ドリップ記録を更新する（抽出情報のみ）", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
          grindSize: 5.0,
        },
      });

      const updateData = {
        grindSize: 6.0,
        brewedBy: "鈴木",
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await PUT(request, createContext(String(tasting.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.grindSize).toBe(6.0);
      expect(data.brewedBy).toBe("鈴木");
    });

    it("画像パスを更新できる", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      const updateData = {
        imagePath: "/images/tastings/updated-image.jpg",
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await PUT(request, createContext(String(tasting.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.imagePath).toBe("/images/tastings/updated-image.jpg");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "PUT",
        { grindSize: 5.0 },
        "http://localhost:3000/api/tastings/99999",
      );
      const response = await PUT(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/tastings/[id]", () => {
    it("ドリップ記録を削除する", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      const request = createRequest(
        "DELETE",
        undefined,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await DELETE(request, createContext(String(tasting.id)));

      expect(response.status).toBe(204);

      // 削除されたことを確認
      const deleted = await prisma.tastingEntry.findUnique({
        where: { id: tasting.id },
      });
      expect(deleted).toBeNull();
    });

    it("関連するテイスティングノートも削除される", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      await prisma.tastingNote.create({
        data: {
          tastingEntryId: tasting.id,
          recordedBy: "田中",
        },
      });

      const request = createRequest(
        "DELETE",
        undefined,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await DELETE(request, createContext(String(tasting.id)));

      expect(response.status).toBe(204);

      // テイスティングノートも削除されたことを確認
      const notes = await prisma.tastingNote.findMany({
        where: { tastingEntryId: tasting.id },
      });
      expect(notes).toHaveLength(0);
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "DELETE",
        undefined,
        "http://localhost:3000/api/tastings/99999",
      );
      const response = await DELETE(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe("beanAmount と brewNotes フィールド", () => {
    describe("POST /api/tastings", () => {
      it("使用した豆のグラム数と抽出メモを含めて作成できる", async () => {
        const tastingData = {
          coffeeBeanId: testBeanId,
          brewDate: "2026-01-25",
          beanAmount: 15.5,
          brewNotes: "湯温92度、蒸らし30秒",
        };

        const request = createRequest("POST", tastingData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.beanAmount).toBe(15.5);
        expect(data.brewNotes).toBe("湯温92度、蒸らし30秒");
      });

      it("beanAmountとbrewNotesは省略可能", async () => {
        const tastingData = {
          coffeeBeanId: testBeanId,
          brewDate: "2026-01-25",
        };

        const request = createRequest("POST", tastingData);
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.beanAmount).toBeNull();
        expect(data.brewNotes).toBeNull();
      });
    });

    describe("PUT /api/tastings/[id]", () => {
      it("beanAmountとbrewNotesを更新できる", async () => {
        const tasting = await prisma.tastingEntry.create({
          data: {
            coffeeBeanId: testBeanId,
            brewDate: new Date(),
          },
        });

        const updateData = {
          beanAmount: 18.0,
          brewNotes: "細挽きで抽出、少し濃いめ",
        };

        const request = createRequest(
          "PUT",
          updateData,
          `http://localhost:3000/api/tastings/${tasting.id}`,
        );
        const response = await PUT(request, createContext(String(tasting.id)));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.beanAmount).toBe(18.0);
        expect(data.brewNotes).toBe("細挽きで抽出、少し濃いめ");
      });
    });

    describe("GET /api/tastings/[id]", () => {
      it("beanAmountとbrewNotesを含めて返す", async () => {
        const tasting = await prisma.tastingEntry.create({
          data: {
            coffeeBeanId: testBeanId,
            brewDate: new Date(),
            beanAmount: 20.0,
            brewNotes: "氷出しコーヒー",
          },
        });

        const request = createRequest(
          "GET",
          undefined,
          `http://localhost:3000/api/tastings/${tasting.id}`,
        );
        const response = await GET_BY_ID(
          request,
          createContext(String(tasting.id)),
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.beanAmount).toBe(20.0);
        expect(data.brewNotes).toBe("氷出しコーヒー");
      });
    });
  });
});

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
  });

  describe("POST /api/tastings", () => {
    it("新しい試飲記録を作成する", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        grindSize: 5.5,
        overallRating: 4,
        notes: "美味しかった",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.coffeeBeanId).toBe(testBeanId);
      expect(data.grindSize).toBe(5.5);
      expect(data.overallRating).toBe(4);
      expect(data.notes).toBe("美味しかった");
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
      expect(data.overallRating).toBeNull();
    });

    it("評価値（酸味、苦味など）を設定できる", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        acidity: 4,
        bitterness: 3,
        sweetness: 5,
        body: "MEDIUM",
        aftertaste: 2,
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.acidity).toBe(4);
      expect(data.bitterness).toBe(3);
      expect(data.sweetness).toBe(5);
      expect(data.body).toBe("MEDIUM");
      expect(data.aftertaste).toBe(2);
    });

    it("フレーバータグを複数設定できる", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        flavorTags: ["BERRY", "CITRUS", "CHOCOLATE"],
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      // flavorTagsはJSON文字列として保存される
      const tags = JSON.parse(data.flavorTags);
      expect(tags).toContain("BERRY");
      expect(tags).toContain("CITRUS");
      expect(tags).toContain("CHOCOLATE");
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

    it("無効なボディ値の場合は400エラー", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        body: "INVALID",
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("評価値が範囲外の場合は400エラー（1-5）", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        acidity: 6, // 範囲外（1-5）
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("総合評価が範囲外の場合は400エラー（1-5）", async () => {
      const tastingData = {
        coffeeBeanId: testBeanId,
        brewDate: "2026-01-25",
        overallRating: 10, // 範囲外
      };

      const request = createRequest("POST", tastingData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/tastings/[id]", () => {
    it("指定したIDの試飲記録を返す", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
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
      expect(data.id).toBe(tasting.id);
      expect(data.overallRating).toBe(4);
      expect(data.coffeeBean).toBeDefined();
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
    it("試飲記録を更新する", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
          overallRating: 3,
        },
      });

      const updateData = {
        overallRating: 5,
        notes: "更新メモ",
        acidity: 4,
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await PUT(request, createContext(String(tasting.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.overallRating).toBe(5);
      expect(data.notes).toBe("更新メモ");
      expect(data.acidity).toBe(4);
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
        { overallRating: 5 },
        "http://localhost:3000/api/tastings/99999",
      );
      const response = await PUT(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("評価値が範囲外の場合は400エラー", async () => {
      const tasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBeanId,
          brewDate: new Date(),
        },
      });

      const request = createRequest(
        "PUT",
        { acidity: 6 },
        `http://localhost:3000/api/tastings/${tasting.id}`,
      );
      const response = await PUT(request, createContext(String(tasting.id)));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/tastings/[id]", () => {
    it("試飲記録を削除する", async () => {
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
});

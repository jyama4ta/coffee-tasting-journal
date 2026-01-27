import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

// テスト用のNext.js API Routeハンドラーをインポート
import { GET, POST } from "@/app/api/beans/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
  PATCH,
} from "@/app/api/beans/[id]/route";

// NextRequestのモック作成ヘルパー
function createRequest(
  method: string,
  body?: object,
  url: string = "http://localhost:3000/api/beans",
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

describe("CoffeeBean API", () => {
  // 各テスト前にDBをクリーンアップ
  beforeEach(async () => {
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();
    await prisma.beanMaster.deleteMany();
    await prisma.shop.deleteMany();
  });

  // テスト後もクリーンアップ
  afterEach(async () => {
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();
    await prisma.beanMaster.deleteMany();
    await prisma.shop.deleteMany();
  });

  describe("GET /api/beans", () => {
    it("空の配列を返す（豆が存在しない場合）", async () => {
      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("全ての豆を返す", async () => {
      // テストデータを作成
      await prisma.coffeeBean.createMany({
        data: [
          { name: "エチオピア イルガチェフェ", origin: "エチオピア" },
          { name: "コロンビア スプレモ", origin: "コロンビア" },
        ],
      });

      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("エチオピア イルガチェフェ");
      expect(data[1].name).toBe("コロンビア スプレモ");
    });

    it("ステータスでフィルタリングできる（在庫中のみ）", async () => {
      // テストデータを作成
      await prisma.coffeeBean.createMany({
        data: [
          { name: "在庫あり1", status: "IN_STOCK" },
          { name: "飲み切り1", status: "FINISHED" },
          { name: "在庫あり2", status: "IN_STOCK" },
        ],
      });

      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/beans?status=IN_STOCK",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(
        data.every((bean: { status: string }) => bean.status === "IN_STOCK"),
      ).toBe(true);
    });

    it("関連する店舗情報を含めて返す", async () => {
      // 店舗を作成
      const shop = await prisma.shop.create({
        data: { name: "テスト店舗" },
      });

      // 豆を作成（店舗に紐づける）
      await prisma.coffeeBean.create({
        data: { name: "テスト豆", shopId: shop.id },
      });

      const request = createRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].shop).toBeDefined();
      expect(data[0].shop.name).toBe("テスト店舗");
    });
  });

  describe("POST /api/beans", () => {
    it("新しい豆を作成する", async () => {
      const beanData = {
        name: "エチオピア イルガチェフェ",
        origin: "エチオピア",
        roastLevel: "LIGHT",
        process: "WASHED",
        notes: "フルーティーな香り",
      };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("エチオピア イルガチェフェ");
      expect(data.origin).toBe("エチオピア");
      expect(data.roastLevel).toBe("LIGHT");
      expect(data.process).toBe("WASHED");
      expect(data.status).toBe("IN_STOCK"); // デフォルト値
      expect(data.id).toBeDefined();
    });

    it("豆名のみで作成できる（任意フィールドは省略可）", async () => {
      const beanData = { name: "シンプルブレンド" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("シンプルブレンド");
      expect(data.origin).toBeNull();
      expect(data.roastLevel).toBeNull();
      expect(data.url).toBeNull();
      expect(data.status).toBe("IN_STOCK");
    });

    it("URLを含めて作成できる", async () => {
      const beanData = {
        name: "スペシャリティコーヒー",
        origin: "エチオピア",
        url: "https://example.com/coffee",
      };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("スペシャリティコーヒー");
      expect(data.url).toBe("https://example.com/coffee");
    });

    it("酸味・苦味・コク・風味の評価を保存できる", async () => {
      const beanData = {
        name: "フレーバーテスト",
        acidityScore: 5,
        bitternessScore: 4,
        bodyScore: 3,
        flavorScore: 2,
      };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.acidityScore).toBe(5);
      expect(data.bitternessScore).toBe(4);
      expect(data.bodyScore).toBe(3);
      expect(data.flavorScore).toBe(2);
    });

    it("評価未指定の場合は0で保存される", async () => {
      const beanData = { name: "スコア未指定" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.acidityScore).toBe(0);
      expect(data.bitternessScore).toBe(0);
      expect(data.bodyScore).toBe(0);
      expect(data.flavorScore).toBe(0);
    });

    it("評価が範囲外（6以上）の場合は400エラー", async () => {
      const beanData = {
        name: "範囲外",
        acidityScore: 6,
      };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("評価が範囲外（負数）の場合は400エラー", async () => {
      const beanData = {
        name: "範囲外",
        bitternessScore: -1,
      };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("店舗を紐づけて作成できる", async () => {
      // 店舗を作成
      const shop = await prisma.shop.create({
        data: { name: "テスト店舗" },
      });

      const beanData = {
        name: "テスト豆",
        shopId: shop.id,
      };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.shopId).toBe(shop.id);
    });

    it("豆名が空の場合は400エラー", async () => {
      const beanData = { name: "" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("豆名がない場合は400エラー", async () => {
      const beanData = { origin: "エチオピア" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("無効な焙煎度の場合は400エラー", async () => {
      const beanData = { name: "テスト", roastLevel: "INVALID" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("無効な精製方法の場合は400エラー", async () => {
      const beanData = { name: "テスト", process: "INVALID" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("存在しない店舗IDの場合は400エラー", async () => {
      const beanData = { name: "テスト", shopId: 99999 };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("飲み切りステータスでの新規登録は400エラー", async () => {
      const beanData = { name: "テスト豆", status: "FINISHED" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("在庫中");
    });

    it("statusを指定しても常に在庫中で作成される", async () => {
      const beanData = { name: "テスト豆", status: "IN_STOCK" };

      const request = createRequest("POST", beanData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.status).toBe("IN_STOCK");
    });

    it("銘柄マスターを指定して作成できる", async () => {
      const origin = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });
      const beanMaster = await prisma.beanMaster.create({
        data: {
          name: "エチオピア イルガチェフェ",
          originId: origin.id,
        },
      });

      const request = createRequest("POST", {
        beanMasterId: beanMaster.id,
        roastLevel: "LIGHT",
        process: "WASHED",
        price: 1500,
        amount: 200,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.beanMasterId).toBe(beanMaster.id);
      // 銘柄マスターから名前を引き継ぐ
      expect(data.name).toBe("エチオピア イルガチェフェ");
    });

    it("銘柄マスター指定時でも名前を上書きできる", async () => {
      const beanMaster = await prisma.beanMaster.create({
        data: {
          name: "エチオピア イルガチェフェ",
        },
      });

      const request = createRequest("POST", {
        beanMasterId: beanMaster.id,
        name: "イルガチェフェ G1",
        origin: "エチオピア シダモ",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.beanMasterId).toBe(beanMaster.id);
      expect(data.name).toBe("イルガチェフェ G1");
      expect(data.origin).toBe("エチオピア シダモ");
    });

    it("存在しない銘柄マスターIDの場合は400エラー", async () => {
      const request = createRequest("POST", {
        beanMasterId: 99999,
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("銘柄マスター");
    });
  });

  describe("GET /api/beans/[id]", () => {
    it("指定したIDの豆を返す（関連する試飲記録も含む）", async () => {
      const bean = await prisma.coffeeBean.create({
        data: { name: "テスト豆", origin: "エチオピア" },
      });

      // 試飲記録を作成
      await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: bean.id,
          brewDate: new Date(),
        },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await GET_BY_ID(request, createContext(String(bean.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(bean.id);
      expect(data.name).toBe("テスト豆");
      expect(data.tastingEntries).toBeDefined();
      expect(data.tastingEntries).toHaveLength(1);
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/beans/99999",
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
        "http://localhost:3000/api/beans/invalid",
      );
      const response = await GET_BY_ID(request, createContext("invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("PUT /api/beans/[id]", () => {
    it("豆を更新する", async () => {
      const bean = await prisma.coffeeBean.create({
        data: { name: "更新前", origin: "ブラジル" },
      });

      const updateData = {
        name: "更新後",
        origin: "エチオピア",
        roastLevel: "MEDIUM",
        notes: "更新メモ",
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await PUT(request, createContext(String(bean.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("更新後");
      expect(data.origin).toBe("エチオピア");
      expect(data.roastLevel).toBe("MEDIUM");
      expect(data.notes).toBe("更新メモ");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "PUT",
        { name: "更新" },
        "http://localhost:3000/api/beans/99999",
      );
      const response = await PUT(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("名前を空に更新しようとすると400エラー", async () => {
      const bean = await prisma.coffeeBean.create({
        data: { name: "元の名前" },
      });

      const request = createRequest(
        "PUT",
        { name: "" },
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await PUT(request, createContext(String(bean.id)));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("PATCH /api/beans/[id] (ステータス変更)", () => {
    it("ステータスを在庫中から飲み切りに変更できる", async () => {
      const bean = await prisma.coffeeBean.create({
        data: { name: "テスト豆", status: "IN_STOCK" },
      });

      const request = createRequest(
        "PATCH",
        { status: "FINISHED" },
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await PATCH(request, createContext(String(bean.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("FINISHED");
      expect(data.finishedDate).toBeDefined(); // 飲み切り日が自動設定
    });

    it("ステータスを飲み切りから在庫中に戻せる", async () => {
      const bean = await prisma.coffeeBean.create({
        data: {
          name: "テスト豆",
          status: "FINISHED",
          finishedDate: new Date(),
        },
      });

      const request = createRequest(
        "PATCH",
        { status: "IN_STOCK" },
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await PATCH(request, createContext(String(bean.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe("IN_STOCK");
      expect(data.finishedDate).toBeNull(); // 飲み切り日がクリア
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "PATCH",
        { status: "FINISHED" },
        "http://localhost:3000/api/beans/99999",
      );
      const response = await PATCH(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("無効なステータスの場合は400エラー", async () => {
      const bean = await prisma.coffeeBean.create({
        data: { name: "テスト豆" },
      });

      const request = createRequest(
        "PATCH",
        { status: "INVALID" },
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await PATCH(request, createContext(String(bean.id)));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/beans/[id]", () => {
    it("豆を削除する（関連する試飲記録も削除）", async () => {
      const bean = await prisma.coffeeBean.create({
        data: { name: "削除対象" },
      });

      // 試飲記録を作成
      await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: bean.id,
          brewDate: new Date(),
        },
      });

      const request = createRequest(
        "DELETE",
        undefined,
        `http://localhost:3000/api/beans/${bean.id}`,
      );
      const response = await DELETE(request, createContext(String(bean.id)));

      expect(response.status).toBe(204);

      // 削除されたことを確認
      const deleted = await prisma.coffeeBean.findUnique({
        where: { id: bean.id },
      });
      expect(deleted).toBeNull();

      // 関連する試飲記録も削除されたことを確認
      const tastings = await prisma.tastingEntry.findMany({
        where: { coffeeBeanId: bean.id },
      });
      expect(tastings).toHaveLength(0);
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "DELETE",
        undefined,
        "http://localhost:3000/api/beans/99999",
      );
      const response = await DELETE(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

// テスト用のNext.js API Routeハンドラーをインポート
import { GET, POST } from "@/app/api/shops/route";
import { GET as GET_BY_ID, PUT, DELETE } from "@/app/api/shops/[id]/route";

// NextRequestのモック作成ヘルパー
function createRequest(
  method: string,
  body?: object,
  url: string = "http://localhost:3000/api/shops",
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

describe("Shop API", () => {
  // 各テスト前にDBをクリーンアップ
  beforeEach(async () => {
    await prisma.shop.deleteMany();
  });

  // テスト後もクリーンアップ
  afterEach(async () => {
    await prisma.shop.deleteMany();
  });

  describe("GET /api/shops", () => {
    it("空の配列を返す（店舗が存在しない場合）", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("全ての店舗を返す", async () => {
      // テストデータを作成
      await prisma.shop.createMany({
        data: [
          { name: "店舗A", address: "東京都" },
          { name: "店舗B", url: "https://example.com" },
        ],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("店舗A");
      expect(data[1].name).toBe("店舗B");
    });
  });

  describe("POST /api/shops", () => {
    it("新しい店舗を作成する", async () => {
      const shopData = {
        name: "新店舗",
        address: "大阪府",
        url: "https://newshop.example.com",
        notes: "テストメモ",
      };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("新店舗");
      expect(data.address).toBe("大阪府");
      expect(data.url).toBe("https://newshop.example.com");
      expect(data.notes).toBe("テストメモ");
      expect(data.id).toBeDefined();
    });

    it("店舗名のみで作成できる（任意フィールドは省略可）", async () => {
      const shopData = { name: "シンプル店舗" };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("シンプル店舗");
      expect(data.address).toBeNull();
      expect(data.url).toBeNull();
      expect(data.notes).toBeNull();
    });

    it("店舗名が空の場合は400エラー", async () => {
      const shopData = { name: "" };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("店舗名がない場合は400エラー", async () => {
      const shopData = { address: "東京都" };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/shops/[id]", () => {
    it("指定したIDの店舗を返す", async () => {
      const shop = await prisma.shop.create({
        data: { name: "取得テスト店舗", address: "京都府" },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await GET_BY_ID(request, createContext(String(shop.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(shop.id);
      expect(data.name).toBe("取得テスト店舗");
      expect(data.address).toBe("京都府");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/shops/99999",
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
        "http://localhost:3000/api/shops/invalid",
      );
      const response = await GET_BY_ID(request, createContext("invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("PUT /api/shops/[id]", () => {
    it("店舗を更新する", async () => {
      const shop = await prisma.shop.create({
        data: { name: "更新前", address: "東京都" },
      });

      const updateData = {
        name: "更新後",
        address: "神奈川県",
        url: "https://updated.example.com",
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await PUT(request, createContext(String(shop.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("更新後");
      expect(data.address).toBe("神奈川県");
      expect(data.url).toBe("https://updated.example.com");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "PUT",
        { name: "更新" },
        "http://localhost:3000/api/shops/99999",
      );
      const response = await PUT(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("名前を空に更新しようとすると400エラー", async () => {
      const shop = await prisma.shop.create({
        data: { name: "元の名前" },
      });

      const request = createRequest(
        "PUT",
        { name: "" },
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await PUT(request, createContext(String(shop.id)));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/shops/[id]", () => {
    it("店舗を削除する", async () => {
      const shop = await prisma.shop.create({
        data: { name: "削除対象" },
      });

      const request = createRequest(
        "DELETE",
        undefined,
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await DELETE(request, createContext(String(shop.id)));

      expect(response.status).toBe(204);

      // 削除されたことを確認
      const deleted = await prisma.shop.findUnique({ where: { id: shop.id } });
      expect(deleted).toBeNull();
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "DELETE",
        undefined,
        "http://localhost:3000/api/shops/99999",
      );
      const response = await DELETE(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe("ブランド名と店舗名", () => {
    it("ブランド名と店舗名を分けて登録できる", async () => {
      const shopData = {
        brandName: "やなか珈琲",
        name: "谷中店",
        address: "東京都台東区",
      };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.brandName).toBe("やなか珈琲");
      expect(data.name).toBe("谷中店");
    });

    it("ブランド名のみでも登録できる（店舗名なし）", async () => {
      const shopData = {
        brandName: "スターバックス",
        name: "",
      };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.brandName).toBe("スターバックス");
      expect(data.name).toBe("");
    });

    it("店舗名のみでも登録できる（従来互換）", async () => {
      const shopData = {
        name: "地元の珈琲屋",
      };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.brandName).toBeNull();
      expect(data.name).toBe("地元の珈琲屋");
    });

    it("ブランド名も店舗名も空の場合は400エラー", async () => {
      const shopData = {
        brandName: "",
        name: "",
      };

      const request = createRequest("POST", shopData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("displayNameにブランド名と店舗名が結合して含まれる", async () => {
      const shop = await prisma.shop.create({
        data: {
          brandName: "やなか珈琲",
          name: "谷中店",
        },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await GET_BY_ID(request, createContext(String(shop.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.displayName).toBe("やなか珈琲 谷中店");
    });

    it("店舗名のみの場合displayNameは店舗名のみ", async () => {
      const shop = await prisma.shop.create({
        data: {
          name: "地元の珈琲屋",
        },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await GET_BY_ID(request, createContext(String(shop.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.displayName).toBe("地元の珈琲屋");
    });

    it("ブランド名のみの場合displayNameはブランド名のみ", async () => {
      const shop = await prisma.shop.create({
        data: {
          brandName: "スターバックス",
          name: "",
        },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/shops/${shop.id}`,
      );
      const response = await GET_BY_ID(request, createContext(String(shop.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.displayName).toBe("スターバックス");
    });

    it("一覧取得時もdisplayNameが含まれる", async () => {
      await prisma.shop.createMany({
        data: [
          { brandName: "やなか珈琲", name: "谷中店" },
          { brandName: "やなか珈琲", name: "千駄木店" },
          { name: "地元の珈琲屋" },
        ],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      expect(data[0].displayName).toBe("やなか珈琲 谷中店");
      expect(data[1].displayName).toBe("やなか珈琲 千駄木店");
      expect(data[2].displayName).toBe("地元の珈琲屋");
    });
  });
});

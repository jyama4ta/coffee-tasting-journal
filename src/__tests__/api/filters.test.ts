import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

import type { EquipmentSize } from "@prisma/client";

// テスト用のNext.js API Routeハンドラーをインポート
import { GET, POST } from "@/app/api/filters/route";
import { GET as GET_BY_ID, PUT, DELETE } from "@/app/api/filters/[id]/route";

// NextRequestのモック作成ヘルパー
function createRequest(
  method: string,
  body?: object,
  url: string = "http://localhost:3000/api/filters",
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

describe("Filter API", () => {
  // 各テスト前にDBをクリーンアップ
  beforeEach(async () => {
    await prisma.filter.deleteMany();
  });

  // テスト後もクリーンアップ
  afterEach(async () => {
    await prisma.filter.deleteMany();
  });

  describe("GET /api/filters", () => {
    it("空の配列を返す（フィルターが存在しない場合）", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("全てのフィルターを返す", async () => {
      // テストデータを作成
      await prisma.filter.createMany({
        data: [
          { name: "HARIOペーパー V60用", type: "PAPER" },
          { name: "コレス ゴールドフィルター", type: "METAL" },
        ],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("HARIOペーパー V60用");
      expect(data[0].type).toBe("PAPER");
      expect(data[1].name).toBe("コレス ゴールドフィルター");
      expect(data[1].type).toBe("METAL");
    });
  });

  describe("POST /api/filters", () => {
    it("新しいフィルターを作成する", async () => {
      const filterData = {
        name: "HARIOペーパー",
        type: "PAPER",
        notes: "漂白タイプ",
      };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("HARIOペーパー");
      expect(data.type).toBe("PAPER");
      expect(data.notes).toBe("漂白タイプ");
      expect(data.id).toBeDefined();
    });

    it("フィルター名のみで作成できる（任意フィールドは省略可）", async () => {
      const filterData = { name: "シンプルフィルター" };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("シンプルフィルター");
      expect(data.url).toBeNull();
      expect(data.type).toBeNull();
    });

    it("URLを含めて作成できる", async () => {
      const filterData = {
        name: "HARIOペーパー",
        type: "PAPER",
        url: "https://www.hario.co.jp/filter.html",
      };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("HARIOペーパー");
      expect(data.url).toBe("https://www.hario.co.jp/filter.html");
      expect(data.notes).toBeNull();
      expect(data.imagePath).toBeNull();
    });

    it("フィルター種類（type）を指定して作成できる", async () => {
      const filterData = { name: "ネルフィルター", type: "CLOTH" };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("ネルフィルター");
      expect(data.type).toBe("CLOTH");
    });

    it("フィルター名が空の場合は400エラー", async () => {
      const filterData = { name: "" };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("フィルター名がない場合は400エラー", async () => {
      const filterData = { type: "PAPER" };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("無効なフィルター種類の場合は400エラー", async () => {
      const filterData = { name: "テスト", type: "INVALID_TYPE" };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/filters/[id]", () => {
    it("指定したIDのフィルターを返す", async () => {
      const filter = await prisma.filter.create({
        data: { name: "V60ペーパー", type: "PAPER" },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/filters/${filter.id}`,
      );
      const response = await GET_BY_ID(
        request,
        createContext(String(filter.id)),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(filter.id);
      expect(data.name).toBe("V60ペーパー");
      expect(data.type).toBe("PAPER");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/filters/99999",
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
        "http://localhost:3000/api/filters/invalid",
      );
      const response = await GET_BY_ID(request, createContext("invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("PUT /api/filters/[id]", () => {
    it("フィルターを更新する", async () => {
      const filter = await prisma.filter.create({
        data: { name: "更新前", type: "PAPER" },
      });

      const updateData = {
        name: "更新後",
        type: "METAL",
        notes: "更新メモ",
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/filters/${filter.id}`,
      );
      const response = await PUT(request, createContext(String(filter.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("更新後");
      expect(data.type).toBe("METAL");
      expect(data.notes).toBe("更新メモ");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "PUT",
        { name: "更新" },
        "http://localhost:3000/api/filters/99999",
      );
      const response = await PUT(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("名前を空に更新しようとすると400エラー", async () => {
      const filter = await prisma.filter.create({
        data: { name: "元の名前" },
      });

      const request = createRequest(
        "PUT",
        { name: "" },
        `http://localhost:3000/api/filters/${filter.id}`,
      );
      const response = await PUT(request, createContext(String(filter.id)));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/filters/[id]", () => {
    it("フィルターを削除する", async () => {
      const filter = await prisma.filter.create({
        data: { name: "削除対象" },
      });

      const request = createRequest(
        "DELETE",
        undefined,
        `http://localhost:3000/api/filters/${filter.id}`,
      );
      const response = await DELETE(request, createContext(String(filter.id)));

      expect(response.status).toBe(204);

      // 削除されたことを確認
      const deleted = await prisma.filter.findUnique({
        where: { id: filter.id },
      });
      expect(deleted).toBeNull();
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "DELETE",
        undefined,
        "http://localhost:3000/api/filters/99999",
      );
      const response = await DELETE(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe("サイズフィールド", () => {
    it("サイズを指定してフィルターを作成できる", async () => {
      const filterData = {
        name: "HARIOペーパー V60用",
        type: "PAPER",
        size: "SIZE_02",
      };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("HARIOペーパー V60用");
      expect(data.size).toBe("SIZE_02");
    });

    it("サイズなしでもフィルターを作成できる", async () => {
      const filterData = {
        name: "汎用フィルター",
        type: "PAPER",
      };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.size).toBeNull();
    });

    it("無効なサイズ値は400エラー", async () => {
      const filterData = {
        name: "テストフィルター",
        size: "INVALID_SIZE",
      };

      const request = createRequest("POST", filterData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("サイズを更新できる", async () => {
      const filter = await prisma.filter.create({
        data: { name: "HARIOペーパー", size: "SIZE_01" },
      });

      const request = createRequest(
        "PUT",
        { size: "SIZE_02" },
        `http://localhost:3000/api/filters/${filter.id}`,
      );
      const response = await PUT(request, createContext(String(filter.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.size).toBe("SIZE_02");
    });

    it("全サイズ値を登録・取得できる", async () => {
      const sizes: EquipmentSize[] = [
        "SIZE_01",
        "SIZE_02",
        "SIZE_03",
        "SIZE_04",
        "OTHER",
      ];

      for (const size of sizes) {
        await prisma.filter.create({
          data: { name: `フィルター_${size}`, size },
        });
      }

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(5);
      sizes.forEach((size, index) => {
        expect(data[index].size).toBe(size);
      });
    });
  });
});

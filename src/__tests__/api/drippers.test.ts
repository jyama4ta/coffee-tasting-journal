import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

// テスト用のNext.js API Routeハンドラーをインポート
import { GET, POST } from "@/app/api/drippers/route";
import { GET as GET_BY_ID, PUT, DELETE } from "@/app/api/drippers/[id]/route";

// NextRequestのモック作成ヘルパー
function createRequest(
  method: string,
  body?: object,
  url: string = "http://localhost:3000/api/drippers",
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

describe("Dripper API", () => {
  // 各テスト前にDBをクリーンアップ
  beforeEach(async () => {
    await prisma.dripper.deleteMany();
  });

  // テスト後もクリーンアップ
  afterEach(async () => {
    await prisma.dripper.deleteMany();
  });

  describe("GET /api/drippers", () => {
    it("空の配列を返す（ドリッパーが存在しない場合）", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("全てのドリッパーを返す", async () => {
      // テストデータを作成
      await prisma.dripper.createMany({
        data: [
          { name: "V60", manufacturer: "HARIO" },
          { name: "カリタ ウェーブ", manufacturer: "Kalita" },
        ],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("V60");
      expect(data[1].name).toBe("カリタ ウェーブ");
    });
  });

  describe("POST /api/drippers", () => {
    it("新しいドリッパーを作成する", async () => {
      const dripperData = {
        name: "V60",
        manufacturer: "HARIO",
        notes: "1〜4杯用",
      };

      const request = createRequest("POST", dripperData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("V60");
      expect(data.manufacturer).toBe("HARIO");
      expect(data.notes).toBe("1〜4杯用");
      expect(data.id).toBeDefined();
    });

    it("ドリッパー名のみで作成できる（任意フィールドは省略可）", async () => {
      const dripperData = { name: "シンプルドリッパー" };

      const request = createRequest("POST", dripperData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("シンプルドリッパー");
      expect(data.manufacturer).toBeNull();
      expect(data.notes).toBeNull();
      expect(data.url).toBeNull();
      expect(data.imagePath).toBeNull();
    });

    it("URLを含めて作成できる", async () => {
      const dripperData = {
        name: "V60",
        manufacturer: "HARIO",
        url: "https://www.hario.co.jp/sp_v60.html",
      };

      const request = createRequest("POST", dripperData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("V60");
      expect(data.url).toBe("https://www.hario.co.jp/sp_v60.html");
    });

    it("ドリッパー名が空の場合は400エラー", async () => {
      const dripperData = { name: "" };

      const request = createRequest("POST", dripperData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("ドリッパー名がない場合は400エラー", async () => {
      const dripperData = { manufacturer: "HARIO" };

      const request = createRequest("POST", dripperData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/drippers/[id]", () => {
    it("指定したIDのドリッパーを返す", async () => {
      const dripper = await prisma.dripper.create({
        data: { name: "V60", manufacturer: "HARIO" },
      });

      const request = createRequest(
        "GET",
        undefined,
        `http://localhost:3000/api/drippers/${dripper.id}`,
      );
      const response = await GET_BY_ID(
        request,
        createContext(String(dripper.id)),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(dripper.id);
      expect(data.name).toBe("V60");
      expect(data.manufacturer).toBe("HARIO");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "GET",
        undefined,
        "http://localhost:3000/api/drippers/99999",
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
        "http://localhost:3000/api/drippers/invalid",
      );
      const response = await GET_BY_ID(request, createContext("invalid"));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("PUT /api/drippers/[id]", () => {
    it("ドリッパーを更新する", async () => {
      const dripper = await prisma.dripper.create({
        data: { name: "更新前", manufacturer: "メーカーA" },
      });

      const updateData = {
        name: "更新後",
        manufacturer: "メーカーB",
        notes: "更新メモ",
      };

      const request = createRequest(
        "PUT",
        updateData,
        `http://localhost:3000/api/drippers/${dripper.id}`,
      );
      const response = await PUT(request, createContext(String(dripper.id)));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("更新後");
      expect(data.manufacturer).toBe("メーカーB");
      expect(data.notes).toBe("更新メモ");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "PUT",
        { name: "更新" },
        "http://localhost:3000/api/drippers/99999",
      );
      const response = await PUT(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("名前を空に更新しようとすると400エラー", async () => {
      const dripper = await prisma.dripper.create({
        data: { name: "元の名前" },
      });

      const request = createRequest(
        "PUT",
        { name: "" },
        `http://localhost:3000/api/drippers/${dripper.id}`,
      );
      const response = await PUT(request, createContext(String(dripper.id)));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("DELETE /api/drippers/[id]", () => {
    it("ドリッパーを削除する", async () => {
      const dripper = await prisma.dripper.create({
        data: { name: "削除対象" },
      });

      const request = createRequest(
        "DELETE",
        undefined,
        `http://localhost:3000/api/drippers/${dripper.id}`,
      );
      const response = await DELETE(request, createContext(String(dripper.id)));

      expect(response.status).toBe(204);

      // 削除されたことを確認
      const deleted = await prisma.dripper.findUnique({
        where: { id: dripper.id },
      });
      expect(deleted).toBeNull();
    });

    it("存在しないIDの場合は404エラー", async () => {
      const request = createRequest(
        "DELETE",
        undefined,
        "http://localhost:3000/api/drippers/99999",
      );
      const response = await DELETE(request, createContext("99999"));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });
});

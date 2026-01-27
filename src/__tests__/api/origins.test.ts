/**
 * 産地マスターAPI テスト
 *
 * 産地（国）を管理するシンプルなマスターAPI
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/origins/route";
import { GET as GET_BY_ID, PUT, DELETE } from "@/app/api/origins/[id]/route";

// テスト用リクエスト作成ヘルパー
function createRequest(method: string, body?: object) {
  const url = new URL("http://localhost:3000/api/origins");
  return new Request(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("Origins API", () => {
  // 各テスト前にデータをクリーンアップ
  beforeEach(async () => {
    await prisma.beanMaster.deleteMany();
    await prisma.originMaster.deleteMany();
  });

  afterEach(async () => {
    await prisma.beanMaster.deleteMany();
    await prisma.originMaster.deleteMany();
  });

  describe("GET /api/origins", () => {
    it("空の一覧を取得できる", async () => {
      const response = await GET();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toEqual([]);
    });

    it("産地一覧を名前順で取得できる", async () => {
      // テストデータ作成
      await prisma.originMaster.createMany({
        data: [
          { name: "コロンビア" },
          { name: "エチオピア" },
          { name: "ブラジル" },
        ],
      });

      const response = await GET();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveLength(3);
      // 名前順でソート
      expect(data[0].name).toBe("エチオピア");
      expect(data[1].name).toBe("コロンビア");
      expect(data[2].name).toBe("ブラジル");
    });
  });

  describe("POST /api/origins", () => {
    it("産地を作成できる", async () => {
      const response = await POST(
        createRequest("POST", { name: "エチオピア" }),
      );

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.name).toBe("エチオピア");
      expect(data.id).toBeDefined();
    });

    it("メモ付きで産地を作成できる", async () => {
      const response = await POST(
        createRequest("POST", {
          name: "エチオピア",
          notes: "フルーティーな豆が多い",
        }),
      );

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.name).toBe("エチオピア");
      expect(data.notes).toBe("フルーティーな豆が多い");
    });

    it("名前が空の場合はエラー", async () => {
      const response = await POST(createRequest("POST", { name: "" }));

      expect(response.status).toBe(400);
    });

    it("名前が重複する場合はエラー", async () => {
      // 最初の作成
      await POST(createRequest("POST", { name: "エチオピア" }));

      // 重複作成
      const response = await POST(
        createRequest("POST", { name: "エチオピア" }),
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/origins/[id]", () => {
    it("産地詳細を取得できる", async () => {
      const origin = await prisma.originMaster.create({
        data: { name: "エチオピア", notes: "テストメモ" },
      });

      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: origin.id.toString() }),
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.name).toBe("エチオピア");
      expect(data.notes).toBe("テストメモ");
    });

    it("存在しないIDの場合は404", async () => {
      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: "99999" }),
      });
      expect(response.status).toBe(404);
    });

    it("無効なIDの場合は400", async () => {
      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: "invalid" }),
      });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/origins/[id]", () => {
    it("産地を更新できる", async () => {
      const origin = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });

      const response = await PUT(
        createRequest("PUT", { name: "ケニア", notes: "更新後メモ" }),
        { params: Promise.resolve({ id: origin.id.toString() }) },
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.name).toBe("ケニア");
      expect(data.notes).toBe("更新後メモ");
    });

    it("存在しないIDの場合は404", async () => {
      const response = await PUT(createRequest("PUT", { name: "ケニア" }), {
        params: Promise.resolve({ id: "99999" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/origins/[id]", () => {
    it("産地を削除できる", async () => {
      const origin = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });

      const response = await DELETE(createRequest("DELETE"), {
        params: Promise.resolve({ id: origin.id.toString() }),
      });

      expect(response.status).toBe(204);

      // 削除確認
      const deleted = await prisma.originMaster.findUnique({
        where: { id: origin.id },
      });
      expect(deleted).toBeNull();
    });

    it("存在しないIDの場合は404", async () => {
      const response = await DELETE(createRequest("DELETE"), {
        params: Promise.resolve({ id: "99999" }),
      });

      expect(response.status).toBe(404);
    });
  });
});

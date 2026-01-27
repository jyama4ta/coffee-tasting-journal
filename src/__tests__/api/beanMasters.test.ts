import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

// APIハンドラーをインポート
import { GET, POST } from "@/app/api/bean-masters/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/bean-masters/[id]/route";

// テスト用リクエスト作成ヘルパー
function createRequest(
  method: string,
  body?: object,
  searchParams?: Record<string, string>,
) {
  const url = new URL("http://localhost:3000/api/bean-masters");
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new Request(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("BeanMaster API", () => {
  // 各テスト前にDBをクリーンアップ
  beforeEach(async () => {
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();
    await prisma.beanMaster.deleteMany();
    await prisma.originMaster.deleteMany();
  });

  afterEach(async () => {
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();
    await prisma.beanMaster.deleteMany();
    await prisma.originMaster.deleteMany();
  });

  describe("GET /api/bean-masters", () => {
    it("空の配列を返す（銘柄が存在しない場合）", async () => {
      const response = await GET(createRequest("GET"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("全ての銘柄を返す", async () => {
      const ethiopia = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });
      const colombia = await prisma.originMaster.create({
        data: { name: "コロンビア" },
      });

      await prisma.beanMaster.createMany({
        data: [
          { name: "エチオピア イルガチェフェ", originId: ethiopia.id },
          { name: "コロンビア スプレモ", originId: colombia.id },
        ],
      });

      const response = await GET(createRequest("GET"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it("名前順でソートされる", async () => {
      await prisma.beanMaster.createMany({
        data: [
          { name: "コロンビア スプレモ" },
          { name: "エチオピア イルガチェフェ" },
        ],
      });

      const response = await GET(createRequest("GET"));
      const data = await response.json();

      expect(data[0].name).toBe("エチオピア イルガチェフェ");
      expect(data[1].name).toBe("コロンビア スプレモ");
    });

    it("産地マスター情報を含む", async () => {
      const ethiopia = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });

      await prisma.beanMaster.create({
        data: { name: "エチオピア イルガチェフェ", originId: ethiopia.id },
      });

      const response = await GET(createRequest("GET"));
      const data = await response.json();

      expect(data[0].origin).toBeDefined();
      expect(data[0].origin.name).toBe("エチオピア");
    });
  });

  describe("POST /api/bean-masters", () => {
    it("新しい銘柄を作成する", async () => {
      const ethiopia = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });

      const response = await POST(
        createRequest("POST", {
          name: "エチオピア イルガチェフェ",
          originId: ethiopia.id,
          notes: "フルーティーな香り",
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("エチオピア イルガチェフェ");
      expect(data.originId).toBe(ethiopia.id);
      expect(data.notes).toBe("フルーティーな香り");
      expect(data.id).toBeDefined();
    });

    it("銘柄名のみで作成できる（任意フィールドは省略可）", async () => {
      const response = await POST(
        createRequest("POST", {
          name: "ブラジル サントス",
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe("ブラジル サントス");
      expect(data.originId).toBeNull();
    });

    it("銘柄名が空の場合は400エラー", async () => {
      const response = await POST(
        createRequest("POST", {
          name: "",
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("銘柄名がない場合は400エラー", async () => {
      const response = await POST(
        createRequest("POST", {
          originId: 1,
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("存在しない産地IDは400エラー", async () => {
      const response = await POST(
        createRequest("POST", {
          name: "テスト銘柄",
          originId: 99999,
        }),
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/bean-masters/[id]", () => {
    it("指定したIDの銘柄を返す", async () => {
      const ethiopia = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });
      const created = await prisma.beanMaster.create({
        data: { name: "エチオピア イルガチェフェ", originId: ethiopia.id },
      });

      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: created.id.toString() }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(created.id);
      expect(data.name).toBe("エチオピア イルガチェフェ");
      expect(data.origin.name).toBe("エチオピア");
    });

    it("存在しないIDの場合は404エラー", async () => {
      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: "99999" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("無効なIDの場合は400エラー", async () => {
      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: "invalid" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("関連する購入記録の件数を含む", async () => {
      const beanMaster = await prisma.beanMaster.create({
        data: { name: "エチオピア イルガチェフェ" },
      });
      await prisma.coffeeBean.createMany({
        data: [
          { name: "エチオピア イルガチェフェ", beanMasterId: beanMaster.id },
          { name: "エチオピア イルガチェフェ", beanMasterId: beanMaster.id },
        ],
      });

      const response = await GET_BY_ID(createRequest("GET"), {
        params: Promise.resolve({ id: beanMaster.id.toString() }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data._count.coffeeBeans).toBe(2);
    });
  });

  describe("PUT /api/bean-masters/[id]", () => {
    it("銘柄を更新する", async () => {
      const ethiopia = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });
      const colombia = await prisma.originMaster.create({
        data: { name: "コロンビア" },
      });
      const created = await prisma.beanMaster.create({
        data: { name: "旧名前", originId: ethiopia.id },
      });

      const response = await PUT(
        createRequest("PUT", {
          name: "新名前",
          originId: colombia.id,
        }),
        { params: Promise.resolve({ id: created.id.toString() }) },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe("新名前");
      expect(data.originId).toBe(colombia.id);
    });

    it("存在しないIDの場合は404エラー", async () => {
      const response = await PUT(createRequest("PUT", { name: "新名前" }), {
        params: Promise.resolve({ id: "99999" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("名前を空に更新しようとすると400エラー", async () => {
      const created = await prisma.beanMaster.create({
        data: { name: "テスト銘柄" },
      });

      const response = await PUT(createRequest("PUT", { name: "" }), {
        params: Promise.resolve({ id: created.id.toString() }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("産地をクリアできる", async () => {
      const ethiopia = await prisma.originMaster.create({
        data: { name: "エチオピア" },
      });
      const created = await prisma.beanMaster.create({
        data: { name: "テスト銘柄", originId: ethiopia.id },
      });

      const response = await PUT(
        createRequest("PUT", {
          name: "テスト銘柄",
          originId: null,
        }),
        { params: Promise.resolve({ id: created.id.toString() }) },
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.originId).toBeNull();
    });
  });

  describe("DELETE /api/bean-masters/[id]", () => {
    it("銘柄を削除する", async () => {
      const created = await prisma.beanMaster.create({
        data: { name: "削除対象" },
      });

      const response = await DELETE(createRequest("DELETE"), {
        params: Promise.resolve({ id: created.id.toString() }),
      });

      expect(response.status).toBe(204);

      // DBから削除されていることを確認
      const found = await prisma.beanMaster.findUnique({
        where: { id: created.id },
      });
      expect(found).toBeNull();
    });

    it("存在しないIDの場合は404エラー", async () => {
      const response = await DELETE(createRequest("DELETE"), {
        params: Promise.resolve({ id: "99999" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("購入記録がある銘柄は削除できない", async () => {
      const beanMaster = await prisma.beanMaster.create({
        data: { name: "購入あり銘柄" },
      });
      await prisma.coffeeBean.create({
        data: { name: "購入あり銘柄", beanMasterId: beanMaster.id },
      });

      const response = await DELETE(createRequest("DELETE"), {
        params: Promise.resolve({ id: beanMaster.id.toString() }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("購入記録");
    });
  });
});

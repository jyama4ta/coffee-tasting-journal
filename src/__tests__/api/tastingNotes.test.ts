import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// TastingNotes API handlers
import {
  GET as getTastingNotes,
  POST as createTastingNote,
} from "@/app/api/tasting-notes/route";
import {
  GET as getTastingNote,
  PUT as updateTastingNote,
  DELETE as deleteTastingNote,
} from "@/app/api/tasting-notes/[id]/route";

// コンテキスト（paramsを含む）のモック作成ヘルパー
function createContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

describe("TastingNotes API", () => {
  let testBean: { id: number };
  let testTasting: { id: number };

  beforeEach(async () => {
    // テストデータをクリーンアップ
    await prisma.tastingNote.deleteMany();
    await prisma.tastingEntry.deleteMany();
    await prisma.coffeeBean.deleteMany();

    // テスト用の豆を作成
    testBean = await prisma.coffeeBean.create({
      data: {
        name: "テスト豆",
        status: "IN_STOCK",
      },
    });

    // テスト用の試飲記録を作成
    testTasting = await prisma.tastingEntry.create({
      data: {
        coffeeBeanId: testBean.id,
        brewDate: new Date("2026-01-25"),
        grindSize: 5.0,
        brewedBy: "テスト抽出者",
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/tasting-notes", () => {
    it("全てのテイスティングノートを取得できる", async () => {
      // テイスティングノートを作成
      await prisma.tastingNote.createMany({
        data: [
          {
            tastingEntryId: testTasting.id,
            recordedBy: "田中",
            overallRating: 4,
          },
          {
            tastingEntryId: testTasting.id,
            recordedBy: "鈴木",
            overallRating: 5,
          },
        ],
      });

      const request = new NextRequest("http://localhost/api/tasting-notes");
      const response = await getTastingNotes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      // ソート順は保証されないため、存在チェックのみ
      const recordedByList = data.map(
        (d: { recordedBy: string }) => d.recordedBy,
      );
      expect(recordedByList).toContain("田中");
      expect(recordedByList).toContain("鈴木");
    });

    it("tastingEntryIdでフィルタリングできる", async () => {
      // 別の試飲記録を作成
      const anotherTasting = await prisma.tastingEntry.create({
        data: {
          coffeeBeanId: testBean.id,
          brewDate: new Date("2026-01-26"),
        },
      });

      await prisma.tastingNote.createMany({
        data: [
          { tastingEntryId: testTasting.id, recordedBy: "田中" },
          { tastingEntryId: anotherTasting.id, recordedBy: "鈴木" },
        ],
      });

      const request = new NextRequest(
        `http://localhost/api/tasting-notes?tastingEntryId=${testTasting.id}`,
      );
      const response = await getTastingNotes(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].recordedBy).toBe("田中");
    });
  });

  describe("POST /api/tasting-notes", () => {
    it("新しいテイスティングノートを作成できる", async () => {
      const request = new NextRequest("http://localhost/api/tasting-notes", {
        method: "POST",
        body: JSON.stringify({
          tastingEntryId: testTasting.id,
          recordedBy: "佐藤",
          acidity: 4,
          bitterness: 3,
          sweetness: 5,
          body: "MEDIUM",
          aftertaste: 4,
          flavorTags: ["BERRY", "CITRUS"],
          overallRating: 4,
          notes: "フルーティーで美味しい",
        }),
      });

      const response = await createTastingNote(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.tastingEntryId).toBe(testTasting.id);
      expect(data.recordedBy).toBe("佐藤");
      expect(data.acidity).toBe(4);
      expect(data.overallRating).toBe(4);
      expect(data.flavorTags).toBe('["BERRY","CITRUS"]');
    });

    it("tastingEntryIdが必須", async () => {
      const request = new NextRequest("http://localhost/api/tasting-notes", {
        method: "POST",
        body: JSON.stringify({
          recordedBy: "田中",
        }),
      });

      const response = await createTastingNote(request);
      expect(response.status).toBe(400);
    });

    it("存在しない試飲記録IDでエラー", async () => {
      const request = new NextRequest("http://localhost/api/tasting-notes", {
        method: "POST",
        body: JSON.stringify({
          tastingEntryId: 99999,
          recordedBy: "田中",
        }),
      });

      const response = await createTastingNote(request);
      expect(response.status).toBe(400);
    });

    it("評価値は1-5の範囲", async () => {
      const request = new NextRequest("http://localhost/api/tasting-notes", {
        method: "POST",
        body: JSON.stringify({
          tastingEntryId: testTasting.id,
          acidity: 10, // 範囲外
        }),
      });

      const response = await createTastingNote(request);
      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/tasting-notes/[id]", () => {
    it("指定したIDのテイスティングノートを取得できる", async () => {
      const note = await prisma.tastingNote.create({
        data: {
          tastingEntryId: testTasting.id,
          recordedBy: "田中",
          overallRating: 4,
        },
      });

      const request = new NextRequest(
        `http://localhost/api/tasting-notes/${note.id}`,
      );
      const response = await getTastingNote(request, {
        params: Promise.resolve({ id: String(note.id) }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(note.id);
      expect(data.recordedBy).toBe("田中");
      expect(data.tastingEntry).toBeDefined();
    });

    it("存在しないIDで404", async () => {
      const request = new NextRequest(
        "http://localhost/api/tasting-notes/99999",
      );
      const response = await getTastingNote(request, {
        params: Promise.resolve({ id: "99999" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/tasting-notes/[id]", () => {
    it("テイスティングノートを更新できる", async () => {
      const note = await prisma.tastingNote.create({
        data: {
          tastingEntryId: testTasting.id,
          recordedBy: "田中",
          overallRating: 3,
        },
      });

      const request = new NextRequest(
        `http://localhost/api/tasting-notes/${note.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            recordedBy: "田中（更新）",
            overallRating: 5,
            notes: "更新後のメモ",
          }),
        },
      );

      const response = await updateTastingNote(request, {
        params: Promise.resolve({ id: String(note.id) }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.recordedBy).toBe("田中（更新）");
      expect(data.overallRating).toBe(5);
      expect(data.notes).toBe("更新後のメモ");
    });

    it("存在しないIDで404", async () => {
      const request = new NextRequest(
        "http://localhost/api/tasting-notes/99999",
        {
          method: "PUT",
          body: JSON.stringify({ overallRating: 5 }),
        },
      );

      const response = await updateTastingNote(request, {
        params: Promise.resolve({ id: "99999" }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/tasting-notes/[id]", () => {
    it("テイスティングノートを削除できる", async () => {
      const note = await prisma.tastingNote.create({
        data: {
          tastingEntryId: testTasting.id,
          recordedBy: "田中",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/tasting-notes/${note.id}`,
        { method: "DELETE" },
      );

      const response = await deleteTastingNote(request, {
        params: Promise.resolve({ id: String(note.id) }),
      });

      expect(response.status).toBe(204);

      // DBから削除されていることを確認
      const deleted = await prisma.tastingNote.findUnique({
        where: { id: note.id },
      });
      expect(deleted).toBeNull();
    });

    it("存在しないIDで404", async () => {
      const request = new NextRequest(
        "http://localhost/api/tasting-notes/99999",
        { method: "DELETE" },
      );

      const response = await deleteTastingNote(request, {
        params: Promise.resolve({ id: "99999" }),
      });

      expect(response.status).toBe(404);
    });
  });
});

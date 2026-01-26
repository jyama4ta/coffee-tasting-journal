/**
 * 画像アップロードAPI テスト
 *
 * TDD: Red フェーズ - テストを先に作成
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs/promises";

// テスト用の画像データディレクトリ
const TEST_UPLOAD_DIR = "/tmp/test-uploads";

// uploadConfigのモック
vi.mock("@/lib/uploadConfig", () => ({
  getUploadDir: () => TEST_UPLOAD_DIR,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  VALID_CATEGORIES: ["beans", "drippers", "filters", "tastings"],
  MIME_TO_EXT: {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  },
}));

// モックの後にインポート
import { POST, DELETE } from "@/app/api/upload/route";

describe("画像アップロードAPI", () => {
  beforeEach(async () => {
    // テスト用ディレクトリを作成
    await fs.mkdir(TEST_UPLOAD_DIR, { recursive: true });
  });

  afterEach(async () => {
    // テスト後にクリーンアップ
    try {
      await fs.rm(TEST_UPLOAD_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("POST /api/upload", () => {
    it("画像ファイルをアップロードできる", async () => {
      // テスト用の画像データ（1x1 PNG）
      const pngData = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );

      const formData = new FormData();
      const blob = new Blob([pngData], { type: "image/png" });
      formData.append("file", blob, "test-image.png");
      formData.append("category", "beans");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.imagePath).toMatch(/^\/images\/beans\/.+\.png$/);
      expect(data.fileName).toBeDefined();
    });

    it("カテゴリごとに適切なディレクトリに保存される", async () => {
      const categories = ["beans", "drippers", "filters", "tastings"];

      for (const category of categories) {
        const pngData = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64",
        );

        const formData = new FormData();
        const blob = new Blob([pngData], { type: "image/png" });
        formData.append("file", blob, "test.png");
        formData.append("category", category);

        const request = new NextRequest("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.imagePath).toContain(`/images/${category}/`);
      }
    });

    it("ファイルが指定されていない場合は400エラー", async () => {
      const formData = new FormData();
      formData.append("category", "beans");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ファイルが指定されていません");
    });

    it("カテゴリが指定されていない場合は400エラー", async () => {
      const pngData = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );

      const formData = new FormData();
      const blob = new Blob([pngData], { type: "image/png" });
      formData.append("file", blob, "test.png");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("カテゴリが指定されていません");
    });

    it("無効なカテゴリの場合は400エラー", async () => {
      const pngData = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );

      const formData = new FormData();
      const blob = new Blob([pngData], { type: "image/png" });
      formData.append("file", blob, "test.png");
      formData.append("category", "invalid");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("無効なカテゴリです");
    });

    it("許可されていないファイル形式の場合は400エラー", async () => {
      const formData = new FormData();
      const blob = new Blob(["test content"], { type: "text/plain" });
      formData.append("file", blob, "test.txt");
      formData.append("category", "beans");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("許可されていないファイル形式です");
    });

    it("JPEG形式の画像をアップロードできる", async () => {
      // 最小限のJPEGデータ
      const jpegData = Buffer.from(
        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==",
        "base64",
      );

      const formData = new FormData();
      const blob = new Blob([jpegData], { type: "image/jpeg" });
      formData.append("file", blob, "test.jpg");
      formData.append("category", "beans");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imagePath).toMatch(/\.jpg$/);
    });

    it("WebP形式の画像をアップロードできる", async () => {
      // 最小限のWebPデータ
      const webpData = Buffer.from(
        "UklGRiYAAABXRUJQVlA4IBoAAAAwAQCdASoBAAEAAkA4JZQCdAEO/hOMAAD++PfyAAA=",
        "base64",
      );

      const formData = new FormData();
      const blob = new Blob([webpData], { type: "image/webp" });
      formData.append("file", blob, "test.webp");
      formData.append("category", "drippers");

      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.imagePath).toMatch(/\.webp$/);
    });
  });

  describe("DELETE /api/upload", () => {
    it("画像ファイルを削除できる", async () => {
      // まずファイルをアップロード
      const pngData = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      );

      const formData = new FormData();
      const blob = new Blob([pngData], { type: "image/png" });
      formData.append("file", blob, "test.png");
      formData.append("category", "beans");

      const uploadRequest = new NextRequest(
        "http://localhost:3000/api/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadResponse = await POST(uploadRequest);
      const uploadData = await uploadResponse.json();

      // 削除リクエスト
      const deleteRequest = new NextRequest(
        "http://localhost:3000/api/upload",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagePath: uploadData.imagePath }),
        },
      );

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
    });

    it("画像パスが指定されていない場合は400エラー", async () => {
      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("画像パスが指定されていません");
    });

    it("存在しないファイルの場合は404エラー", async () => {
      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: "/images/beans/nonexistent.png" }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("ファイルが見つかりません");
    });

    it("ディレクトリトラバーサル攻撃を防止する", async () => {
      const request = new NextRequest("http://localhost:3000/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: "../../../etc/passwd" }),
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("無効なパスです");
    });
  });
});

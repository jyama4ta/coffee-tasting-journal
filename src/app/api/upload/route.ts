/**
 * 画像アップロードAPI
 *
 * POST: 画像をアップロード
 * DELETE: 画像を削除
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  getUploadDir,
  ALLOWED_TYPES,
  VALID_CATEGORIES,
  MIME_TO_EXT,
} from "@/lib/uploadConfig";

/**
 * POST /api/upload
 * 画像をアップロード
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | Blob | null;
    const category = formData.get("category") as string | null;

    // バリデーション: ファイル（BlobまたはFile）
    if (!file || !("size" in file) || file.size === 0) {
      return NextResponse.json(
        { error: "ファイルが指定されていません" },
        { status: 400 },
      );
    }

    // バリデーション: カテゴリ
    if (!category) {
      return NextResponse.json(
        { error: "カテゴリが指定されていません" },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "無効なカテゴリです" },
        { status: 400 },
      );
    }

    // バリデーション: ファイル形式
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `許可されていないファイル形式です。許可形式: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // ファイル名を生成（UUID + 拡張子）
    const ext = MIME_TO_EXT[file.type] || ".jpg";
    const fileName = `${randomUUID()}${ext}`;

    // 保存先ディレクトリ
    const uploadDir = getUploadDir();
    const categoryDir = path.join(uploadDir, category);

    // ディレクトリを作成
    await fs.mkdir(categoryDir, { recursive: true });

    // ファイルを保存
    const filePath = path.join(categoryDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // レスポンス用のパス（公開URL用）
    const imagePath = `/images/${category}/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        imagePath,
        fileName,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/upload
 * 画像を削除
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath } = body;

    // バリデーション: パス
    if (!imagePath) {
      return NextResponse.json(
        { error: "画像パスが指定されていません" },
        { status: 400 },
      );
    }

    // セキュリティ: ディレクトリトラバーサル防止
    if (imagePath.includes("..") || !imagePath.startsWith("/images/")) {
      return NextResponse.json({ error: "無効なパスです" }, { status: 400 });
    }

    // 実際のファイルパスに変換
    const uploadDir = getUploadDir();
    const relativePath = imagePath.replace("/images/", "");
    const filePath = path.join(uploadDir, relativePath);

    // ファイルの存在確認
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "ファイルが見つかりません" },
        { status: 404 },
      );
    }

    // ファイル削除
    await fs.unlink(filePath);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}

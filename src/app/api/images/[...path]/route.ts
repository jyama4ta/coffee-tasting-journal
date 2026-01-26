/**
 * 画像配信API
 *
 * GET /api/images/[...path]
 * アップロードされた画像を配信
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/uploadConfig";

// MIMEタイプの判定
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

interface Context {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, context: Context) {
  const { path: pathSegments } = await context.params;

  // パスの結合
  const relativePath = pathSegments.join("/");

  // セキュリティ: ディレクトリトラバーサル防止
  if (relativePath.includes("..")) {
    return NextResponse.json({ error: "無効なパスです" }, { status: 400 });
  }

  // ファイルパスの構築
  const uploadDir = getUploadDir();
  const filePath = path.join(uploadDir, relativePath);

  try {
    // ファイルの存在確認
    await fs.access(filePath);

    // ファイル読み込み
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(filePath);

    // レスポンス
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "画像が見つかりません" },
      { status: 404 },
    );
  }
}

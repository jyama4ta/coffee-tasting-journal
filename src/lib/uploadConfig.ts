/**
 * 画像アップロード設定
 */

// 許可する画像形式
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ファイルサイズ上限（5MB）
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 有効なカテゴリ
export const VALID_CATEGORIES = ["beans", "drippers", "filters", "tastings"];

// MIMEタイプから拡張子へのマッピング
export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/**
 * アップロードディレクトリを取得
 */
export function getUploadDir(): string {
  // 本番環境では /app/data/images、開発環境では ./data/images
  return process.env.UPLOAD_DIR || "./data/images";
}

/**
 * 日付/時刻のユーティリティ関数
 * サーバー環境のタイムゾーン（TZ環境変数）に従って表示
 * データはUTCで保存し、表示時に変換
 */

/**
 * 日付を環境のタイムゾーンでフォーマットする（日付のみ）
 * 例: 2026年1月25日
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 日付を環境のタイムゾーンでフォーマットする（日付と時刻）
 * 例: 2026年1月25日 10:30
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 日付を環境のタイムゾーンでフォーマットする（短縮形、日付と時刻）
 * 例: 1/25 10:30
 */
export function formatDateTimeShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 現在時刻をdatetime-local用の形式で返す（ローカルタイムゾーン）
 * 例: 2026-01-25T10:30
 */
export function getNowForDatetimeLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * ISO日付文字列をdatetime-local用の形式に変換（ローカルタイムゾーンで）
 * 例: 2026-01-25T01:30:00.000Z → 2026-01-25T10:30 (TZ=Asia/Tokyoの場合)
 */
export function toDatetimeLocal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * アプリケーション共通の定数定義
 */

// 焙煎度
export const ROAST_LEVELS = [
  { value: "", label: "選択なし" },
  { value: "LIGHT", label: "ライトロースト（浅煎り）" },
  { value: "CINNAMON", label: "シナモンロースト（浅煎り）" },
  { value: "MEDIUM", label: "ミディアムロースト（中浅煎り）" },
  { value: "HIGH", label: "ハイロースト・ダークロースト（中煎り）" },
  { value: "CITY", label: "シティロースト（中煎り）" },
  { value: "FULL_CITY", label: "フルシティロースト（中深煎り）" },
  { value: "FRENCH", label: "フレンチロースト（深煎り）" },
  { value: "ITALIAN", label: "イタリアンロースト（深煎り）" },
] as const;

// 一覧表示用の短いラベル
export const ROAST_LEVEL_SHORT_LABELS: Record<string, string> = {
  LIGHT: "ライトロースト",
  CINNAMON: "シナモンロースト",
  MEDIUM: "ミディアムロースト",
  HIGH: "ハイロースト・ダークロースト",
  CITY: "シティロースト",
  FULL_CITY: "フルシティロースト",
  FRENCH: "フレンチロースト",
  ITALIAN: "イタリアンロースト",
};

// 詳細表示用のラベル（5段階マッピング付き）
export const ROAST_LEVEL_LABELS: Record<string, string> = {
  LIGHT: "ライトロースト（浅煎り）",
  CINNAMON: "シナモンロースト（浅煎り）",
  MEDIUM: "ミディアムロースト（中浅煎り）",
  HIGH: "ハイロースト・ダークロースト（中煎り）",
  CITY: "シティロースト（中煎り）",
  FULL_CITY: "フルシティロースト（中深煎り）",
  FRENCH: "フレンチロースト（深煎り）",
  ITALIAN: "イタリアンロースト（深煎り）",
};

// 精製方法
export const PROCESSES = [
  { value: "", label: "選択なし" },
  { value: "WASHED", label: "ウォッシュド" },
  { value: "NATURAL", label: "ナチュラル" },
  { value: "HONEY", label: "ハニー" },
  { value: "PULPED_NATURAL", label: "パルプドナチュラル" },
  { value: "SEMI_WASHED", label: "セミウォッシュド" },
] as const;

export const PROCESS_LABELS: Record<string, string> = {
  WASHED: "ウォッシュド",
  NATURAL: "ナチュラル",
  HONEY: "ハニー",
  PULPED_NATURAL: "パルプドナチュラル",
  SEMI_WASHED: "セミウォッシュド",
};

// 豆タイプ
export const BEAN_TYPES = [
  { value: "", label: "選択なし" },
  { value: "SINGLE_ORIGIN", label: "シングルオリジン" },
  { value: "BLEND", label: "ブレンド" },
] as const;

export const BEAN_TYPE_LABELS: Record<string, string> = {
  SINGLE_ORIGIN: "シングルオリジン",
  BLEND: "ブレンド",
};

// 豆ステータス
export const BEAN_STATUS_LABELS: Record<string, string> = {
  IN_STOCK: "在庫中",
  FINISHED: "飲み切り",
};

// フィルター種類
export const FILTER_TYPES = [
  { value: "", label: "選択なし" },
  { value: "PAPER", label: "ペーパー" },
  { value: "METAL", label: "金属" },
  { value: "CLOTH", label: "布" },
] as const;

export const FILTER_TYPE_LABELS: Record<string, string> = {
  PAPER: "ペーパー",
  METAL: "金属",
  CLOTH: "布",
};

// 器具サイズ
export const EQUIPMENT_SIZES = [
  { value: "", label: "-- 選択してください --" },
  { value: "SIZE_01", label: "01（1-2杯用）" },
  { value: "SIZE_02", label: "02（1-4杯用）" },
  { value: "SIZE_03", label: "03（3-6杯用）" },
  { value: "SIZE_04", label: "04（4-8杯用）" },
  { value: "OTHER", label: "その他" },
] as const;

export const EQUIPMENT_SIZE_LABELS: Record<string, string> = {
  SIZE_01: "01（1-2杯用）",
  SIZE_02: "02（1-4杯用）",
  SIZE_03: "03（3-6杯用）",
  SIZE_04: "04（4-8杯用）",
  OTHER: "その他",
};

// ボディ
export const BODY_OPTIONS = [
  { value: "", label: "選択なし" },
  { value: "LIGHT", label: "軽い" },
  { value: "MEDIUM", label: "中程度" },
  { value: "HEAVY", label: "重い" },
] as const;

export const BODY_LABELS: Record<string, string> = {
  LIGHT: "軽い",
  MEDIUM: "中程度",
  HEAVY: "重い",
};

// フレーバータグ
export const FLAVOR_TAGS = [
  // フルーツ系
  { value: "BERRY", label: "ベリー", category: "フルーツ系" },
  { value: "CITRUS", label: "シトラス", category: "フルーツ系" },
  { value: "TROPICAL", label: "トロピカル", category: "フルーツ系" },
  { value: "STONE_FRUIT", label: "ストーンフルーツ", category: "フルーツ系" },
  // ナッツ/甘味系
  { value: "CHOCOLATE", label: "チョコレート", category: "ナッツ/甘味系" },
  { value: "NUTTY", label: "ナッツ", category: "ナッツ/甘味系" },
  { value: "CARAMEL", label: "キャラメル", category: "ナッツ/甘味系" },
  { value: "HONEY", label: "はちみつ", category: "ナッツ/甘味系" },
  // その他
  { value: "FLORAL", label: "フローラル", category: "その他" },
  { value: "SPICY", label: "スパイス", category: "その他" },
  { value: "HERBAL", label: "ハーブ", category: "その他" },
  { value: "EARTHY", label: "アーシー", category: "その他" },
] as const;

export const FLAVOR_TAG_LABELS: Record<string, string> = {
  BERRY: "ベリー",
  CITRUS: "シトラス",
  TROPICAL: "トロピカル",
  STONE_FRUIT: "ストーンフルーツ",
  CHOCOLATE: "チョコレート",
  NUTTY: "ナッツ",
  CARAMEL: "キャラメル",
  HONEY: "はちみつ",
  FLORAL: "フローラル",
  SPICY: "スパイス",
  HERBAL: "ハーブ",
  EARTHY: "アーシー",
};

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import StarRating from "@/components/StarRating";

interface Shop {
  id: number;
  name: string;
}

const ROAST_LEVELS = [
  { value: "", label: "選択なし" },
  { value: "LIGHT", label: "ライトロースト（浅煎り）" },
  { value: "CINNAMON", label: "シナモンロースト（浅煎り）" },
  { value: "MEDIUM", label: "ミディアムロースト（中浅煎り）" },
  { value: "HIGH", label: "ハイロースト（中煎り）" },
  { value: "CITY", label: "シティロースト（中煎り）" },
  { value: "FULL_CITY", label: "フルシティロースト（中深煎り）" },
  { value: "FRENCH", label: "フレンチロースト（深煎り）" },
  { value: "ITALIAN", label: "イタリアンロースト（深煎り）" },
];

const PROCESSES = [
  { value: "", label: "選択なし" },
  { value: "WASHED", label: "ウォッシュド" },
  { value: "NATURAL", label: "ナチュラル" },
  { value: "HONEY", label: "ハニー" },
  { value: "PULPED_NATURAL", label: "パルプドナチュラル" },
  { value: "SEMI_WASHED", label: "セミウォッシュド" },
];

const BEAN_TYPES = [
  { value: "", label: "選択なし" },
  { value: "SINGLE_ORIGIN", label: "シングルオリジン" },
  { value: "BLEND", label: "ブレンド" },
];

export default function NewBeanForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [acidityScore, setAcidityScore] = useState(0);
  const [bitternessScore, setBitternessScore] = useState(0);
  const [bodyScore, setBodyScore] = useState(0);
  const [flavorScore, setFlavorScore] = useState(0);

  const defaultShopId = searchParams.get("shopId") || "";

  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function fetchShops() {
      const response = await fetch("/api/shops");
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    }
    fetchShops();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      origin: (formData.get("origin") as string) || null,
      roastLevel: (formData.get("roastLevel") as string) || null,
      process: (formData.get("process") as string) || null,
      isDecaf: formData.get("isDecaf") === "on",
      beanType: (formData.get("beanType") as string) || null,
      notes: (formData.get("notes") as string) || null,
      url: (formData.get("url") as string) || null,
      purchaseDate: (formData.get("purchaseDate") as string) || null,
      price: formData.get("price")
        ? parseInt(formData.get("price") as string, 10)
        : null,
      amount: formData.get("amount")
        ? parseInt(formData.get("amount") as string, 10)
        : null,
      shopId: formData.get("shopId")
        ? parseInt(formData.get("shopId") as string, 10)
        : null,
      imagePath,
      acidityScore,
      bitternessScore,
      bodyScore,
      flavorScore,
    };

    try {
      const response = await fetch("/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "登録に失敗しました");
      }

      router.push("/beans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 space-y-6"
    >
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* 基本情報 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          基本情報
        </h2>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            銘柄 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例: エチオピア イルガチェフェ"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="origin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              産地
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: エチオピア"
            />
          </div>
          <div>
            <label
              htmlFor="beanType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              タイプ
            </label>
            <select
              id="beanType"
              name="beanType"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {BEAN_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="roastLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              焙煎度
            </label>
            <select
              id="roastLevel"
              name="roastLevel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {ROAST_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="process"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              精製方法
            </label>
            <select
              id="process"
              name="process"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {PROCESSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDecaf"
            name="isDecaf"
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="isDecaf" className="ml-2 text-sm text-gray-700">
            デカフェ
          </label>
        </div>
      </div>

      {/* 味わい評価 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          味わい評価
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StarRating
            name="acidityScore"
            label="酸味"
            icon="bean"
            minValue={0}
            value={acidityScore}
            onChange={(val) => setAcidityScore(val ?? 0)}
          />
          <StarRating
            name="bitternessScore"
            label="苦味"
            icon="bean"
            minValue={0}
            value={bitternessScore}
            onChange={(val) => setBitternessScore(val ?? 0)}
          />
          <StarRating
            name="bodyScore"
            label="コク"
            icon="bean"
            minValue={0}
            value={bodyScore}
            onChange={(val) => setBodyScore(val ?? 0)}
          />
          <StarRating
            name="flavorScore"
            label="風味"
            icon="bean"
            minValue={0}
            value={flavorScore}
            onChange={(val) => setFlavorScore(val ?? 0)}
          />
        </div>
      </div>

      {/* 購入情報 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          購入情報
        </h2>

        <div>
          <label
            htmlFor="shopId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            購入店
          </label>
          <select
            id="shopId"
            name="shopId"
            defaultValue={defaultShopId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">選択なし</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="purchaseDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              購入日
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              defaultValue={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              価格（円）
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: 1500"
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              購入量（g）
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="0"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: 200"
            />
          </div>
        </div>
      </div>

      {/* URL */}
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          商品ページURL
        </label>
        <input
          type="url"
          id="url"
          name="url"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="https://example.com/coffee"
        />
      </div>

      {/* メモ */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          メモ
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="パッケージの説明、店員のおすすめ情報など"
        />
      </div>

      {/* 画像 */}
      <ImageUpload
        category="beans"
        currentImagePath={imagePath}
        onImageChange={setImagePath}
        label="豆の画像"
      />

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "登録中..." : "登録する"}
        </Button>
        <Button href="/beans" variant="outline">
          キャンセル
        </Button>
      </div>
    </form>
  );
}

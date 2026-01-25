"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";

interface Bean {
  id: number;
  name: string;
  status: string;
}

interface Dripper {
  id: number;
  name: string;
}

interface Filter {
  id: number;
  name: string;
}

const BODY_OPTIONS = [
  { value: "", label: "選択なし" },
  { value: "LIGHT", label: "軽い" },
  { value: "MEDIUM", label: "中程度" },
  { value: "HEAVY", label: "重い" },
];

const FLAVOR_TAGS = [
  { value: "BERRY", label: "ベリー", category: "フルーツ系" },
  { value: "CITRUS", label: "シトラス", category: "フルーツ系" },
  { value: "TROPICAL", label: "トロピカル", category: "フルーツ系" },
  { value: "STONE_FRUIT", label: "ストーンフルーツ", category: "フルーツ系" },
  { value: "CHOCOLATE", label: "チョコレート", category: "ナッツ/甘味系" },
  { value: "NUTTY", label: "ナッツ", category: "ナッツ/甘味系" },
  { value: "CARAMEL", label: "キャラメル", category: "ナッツ/甘味系" },
  { value: "HONEY", label: "はちみつ", category: "ナッツ/甘味系" },
  { value: "FLORAL", label: "フローラル", category: "その他" },
  { value: "SPICE", label: "スパイス", category: "その他" },
  { value: "HERBAL", label: "ハーブ", category: "その他" },
  { value: "EARTHY", label: "アーシー", category: "その他" },
];

export default function NewTastingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [drippers, setDrippers] = useState<Dripper[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultBeanId = searchParams.get("beanId") || "";

  useEffect(() => {
    async function fetchData() {
      const [beansRes, drippersRes, filtersRes] = await Promise.all([
        fetch("/api/beans?status=IN_STOCK"),
        fetch("/api/drippers"),
        fetch("/api/filters"),
      ]);

      if (beansRes.ok) setBeans(await beansRes.json());
      if (drippersRes.ok) setDrippers(await drippersRes.json());
      if (filtersRes.ok) setFilters(await filtersRes.json());
    }
    fetchData();
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      coffeeBeanId: parseInt(formData.get("coffeeBeanId") as string, 10),
      dripperId: formData.get("dripperId")
        ? parseInt(formData.get("dripperId") as string, 10)
        : null,
      filterId: formData.get("filterId")
        ? parseInt(formData.get("filterId") as string, 10)
        : null,
      grindSize: formData.get("grindSize")
        ? parseFloat(formData.get("grindSize") as string)
        : null,
      brewDate:
        (formData.get("brewDate") as string) ||
        new Date().toISOString().split("T")[0],
      acidity: formData.get("acidity")
        ? parseInt(formData.get("acidity") as string, 10)
        : null,
      bitterness: formData.get("bitterness")
        ? parseInt(formData.get("bitterness") as string, 10)
        : null,
      sweetness: formData.get("sweetness")
        ? parseInt(formData.get("sweetness") as string, 10)
        : null,
      body: (formData.get("body") as string) || null,
      aftertaste: formData.get("aftertaste")
        ? parseInt(formData.get("aftertaste") as string, 10)
        : null,
      flavorTags: selectedTags.length > 0 ? selectedTags : null,
      overallRating: formData.get("overallRating")
        ? parseInt(formData.get("overallRating") as string, 10)
        : null,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      const response = await fetch("/api/tastings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "登録に失敗しました");
      }

      router.push("/tastings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const groupedTags = FLAVOR_TAGS.reduce(
    (acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    },
    {} as Record<string, typeof FLAVOR_TAGS>,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-6 space-y-6"
    >
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* 抽出情報 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          抽出情報
        </h2>

        <div>
          <label
            htmlFor="coffeeBeanId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            豆 <span className="text-red-500">*</span>
          </label>
          <select
            id="coffeeBeanId"
            name="coffeeBeanId"
            required
            defaultValue={defaultBeanId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">選択してください</option>
            {beans.map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name}
              </option>
            ))}
          </select>
          {beans.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              在庫中の豆がありません。先に
              <a href="/beans/new" className="text-amber-600 hover:underline">
                豆を登録
              </a>
              してください。
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="dripperId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ドリッパー
            </label>
            <select
              id="dripperId"
              name="dripperId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択なし</option>
              {drippers.map((dripper) => (
                <option key={dripper.id} value={dripper.id}>
                  {dripper.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="filterId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              フィルター
            </label>
            <select
              id="filterId"
              name="filterId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択なし</option>
              {filters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="grindSize"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              挽き目（1.0-10.0）
            </label>
            <input
              type="number"
              id="grindSize"
              name="grindSize"
              min="1"
              max="10"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: 5.0"
            />
          </div>
          <div>
            <label
              htmlFor="brewDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              抽出日
            </label>
            <input
              type="date"
              id="brewDate"
              name="brewDate"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 評価 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          評価
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="acidity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              酸味（1-10）
            </label>
            <input
              type="number"
              id="acidity"
              name="acidity"
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label
              htmlFor="bitterness"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              苦味（1-10）
            </label>
            <input
              type="number"
              id="bitterness"
              name="bitterness"
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label
              htmlFor="sweetness"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              甘味（1-10）
            </label>
            <input
              type="number"
              id="sweetness"
              name="sweetness"
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label
              htmlFor="aftertaste"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              後味（1-10）
            </label>
            <input
              type="number"
              id="aftertaste"
              name="aftertaste"
              min="1"
              max="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="body"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ボディ
            </label>
            <select
              id="body"
              name="body"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {BODY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="overallRating"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              総合評価（1-5）
            </label>
            <select
              id="overallRating"
              name="overallRating"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択なし</option>
              <option value="1">★☆☆☆☆ (1)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="5">★★★★★ (5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* フレーバータグ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          フレーバータグ
        </h2>
        {Object.entries(groupedTags).map(([category, tags]) => (
          <div key={category}>
            <p className="text-sm text-gray-600 mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.value)
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* メモ */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          テイスティングノート
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="味の感想、抽出時の工夫など"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "登録中..." : "登録する"}
        </Button>
        <Button href="/tastings" variant="outline">
          キャンセル
        </Button>
      </div>
    </form>
  );
}

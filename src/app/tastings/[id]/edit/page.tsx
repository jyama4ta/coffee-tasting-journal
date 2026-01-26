"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";
import GrindSizeSlider from "@/components/GrindSizeSlider";
import ImageUpload from "@/components/ImageUpload";

interface Bean {
  id: number;
  name: string;
}

interface Dripper {
  id: number;
  name: string;
}

interface Filter {
  id: number;
  name: string;
}

interface Tasting {
  id: number;
  coffeeBeanId: number;
  dripperId: number | null;
  filterId: number | null;
  grindSize: number | null;
  brewDate: string;
  acidity: number | null;
  bitterness: number | null;
  sweetness: number | null;
  body: string | null;
  aftertaste: number | null;
  flavorTags: string[] | null;
  overallRating: number | null;
  notes: string | null;
  imagePath: string | null;
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

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditTastingPage({ params }: Props) {
  const router = useRouter();
  const [tasting, setTasting] = useState<Tasting | null>(null);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [drippers, setDrippers] = useState<Dripper[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 評価のState（5段階）
  const [acidity, setAcidity] = useState<number | null>(null);
  const [bitterness, setBitterness] = useState<number | null>(null);
  const [sweetness, setSweetness] = useState<number | null>(null);
  const [aftertaste, setAftertaste] = useState<number | null>(null);
  const [overallRating, setOverallRating] = useState<number | null>(null);

  // 挽き目のState
  const [grindSize, setGrindSize] = useState<number | null>(null);

  // 画像パスのState
  const [imagePath, setImagePath] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { id } = await params;
      try {
        const [tastingRes, beansRes, drippersRes, filtersRes] =
          await Promise.all([
            fetch(`/api/tastings/${id}`),
            fetch("/api/beans"),
            fetch("/api/drippers"),
            fetch("/api/filters"),
          ]);

        if (!tastingRes.ok) {
          throw new Error("試飲記録が見つかりません");
        }

        const tastingData = await tastingRes.json();
        setTasting(tastingData);
        setSelectedTags(tastingData.flavorTags || []);

        // 評価値の初期化
        setAcidity(tastingData.acidity);
        setBitterness(tastingData.bitterness);
        setSweetness(tastingData.sweetness);
        setAftertaste(tastingData.aftertaste);
        setOverallRating(tastingData.overallRating);
        setGrindSize(tastingData.grindSize);
        setImagePath(tastingData.imagePath);

        if (beansRes.ok) setBeans(await beansRes.json());
        if (drippersRes.ok) setDrippers(await drippersRes.json());
        if (filtersRes.ok) setFilters(await filtersRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tasting) return;

    setSaving(true);
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
      grindSize,
      brewDate: formData.get("brewDate") as string,
      acidity,
      bitterness,
      sweetness,
      body: (formData.get("body") as string) || null,
      aftertaste,
      flavorTags: selectedTags.length > 0 ? selectedTags : null,
      overallRating,
      notes: (formData.get("notes") as string) || null,
      imagePath,
    };

    try {
      const response = await fetch(`/api/tastings/${tasting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "更新に失敗しました");
      }

      router.push(`/tastings/${tasting.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-red-600">{error || "試飲記録が見つかりません"}</p>
        <Button href="/tastings" variant="outline" className="mt-4">
          試飲記録一覧に戻る
        </Button>
      </div>
    );
  }

  const brewDateValue = new Date(tasting.brewDate).toISOString().split("T")[0];

  const groupedTags = FLAVOR_TAGS.reduce(
    (acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    },
    {} as Record<string, typeof FLAVOR_TAGS>,
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📝 試飲記録編集</h1>
        <p className="text-gray-600">記録を編集します</p>
      </div>

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
              defaultValue={tasting.coffeeBeanId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {beans.map((bean) => (
                <option key={bean.id} value={bean.id}>
                  {bean.name}
                </option>
              ))}
            </select>
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
                defaultValue={tasting.dripperId || ""}
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
                defaultValue={tasting.filterId || ""}
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

          <GrindSizeSlider
            name="grindSize"
            value={grindSize}
            onChange={setGrindSize}
          />

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
              defaultValue={brewDateValue}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* 評価 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
            評価
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StarRating
              name="acidity"
              label="酸味"
              value={acidity}
              onChange={setAcidity}
            />
            <StarRating
              name="bitterness"
              label="苦味"
              value={bitterness}
              onChange={setBitterness}
            />
            <StarRating
              name="sweetness"
              label="甘味"
              value={sweetness}
              onChange={setSweetness}
            />
            <StarRating
              name="aftertaste"
              label="後味"
              value={aftertaste}
              onChange={setAftertaste}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                defaultValue={tasting.body || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {BODY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <StarRating
              name="overallRating"
              label="総合評価"
              value={overallRating}
              onChange={setOverallRating}
            />
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
            defaultValue={tasting.notes || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* 画像 */}
        <ImageUpload
          category="tastings"
          currentImagePath={imagePath}
          onImageChange={setImagePath}
          label="抽出写真"
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存する"}
          </Button>
          <Button href={`/tastings/${tasting.id}`} variant="outline">
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import GrindSizeSlider from "@/components/GrindSizeSlider";
import ImageUpload from "@/components/ImageUpload";
import { toDatetimeLocal } from "@/lib/dateUtils";

interface Bean {
  id: number;
  name: string;
  purchaseDate: string | null;
  isDecaf: boolean;
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
  beanAmount: number | null;
  brewDate: string;
  imagePath: string | null;
  brewedBy: string | null;
  brewNotes: string | null;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditTastingPage({ params }: Props) {
  const router = useRouter();
  const [tasting, setTasting] = useState<Tasting | null>(null);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [drippers, setDrippers] = useState<Dripper[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 挽き目のState
  const [grindSize, setGrindSize] = useState<number | null>(null);
  // 使用した豆のグラム数のState
  const [beanAmount, setBeanAmount] = useState<number | null>(null);
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
          throw new Error("ドリップ記録が見つかりません");
        }

        const tastingData = await tastingRes.json();
        setTasting(tastingData);
        setGrindSize(tastingData.grindSize);
        setBeanAmount(tastingData.beanAmount);
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
      beanAmount,
      brewDate: formData.get("brewDate") as string,
      imagePath,
      brewedBy: (formData.get("brewedBy") as string) || null,
      brewNotes: (formData.get("brewNotes") as string) || null,
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
        <p className="text-red-600">
          {error || "ドリップ記録が見つかりません"}
        </p>
        <Button href="/tastings" variant="outline" className="mt-4">
          ドリップ記録一覧に戻る
        </Button>
      </div>
    );
  }

  const brewDateValue = toDatetimeLocal(tasting.brewDate);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          📝 ドリップ記録編集
        </h1>
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
              コーヒー豆 <span className="text-red-500">*</span>
            </label>
            <select
              id="coffeeBeanId"
              name="coffeeBeanId"
              required
              defaultValue={tasting.coffeeBeanId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {beans.map((bean) => {
                const datePrefix = bean.purchaseDate
                  ? `(${new Date(bean.purchaseDate).toLocaleDateString("ja-JP", { month: "2-digit", day: "2-digit" })}) `
                  : "";
                const decafSuffix = bean.isDecaf ? " デカフェ" : "";
                return (
                  <option key={bean.id} value={bean.id}>
                    {datePrefix}
                    {bean.name}
                    {decafSuffix}
                  </option>
                );
              })}
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
              htmlFor="beanAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              使用した豆の量 (g)
            </label>
            <input
              type="number"
              id="beanAmount"
              name="beanAmount"
              step="0.1"
              min="0"
              value={beanAmount ?? ""}
              onChange={(e) =>
                setBeanAmount(e.target.value ? parseFloat(e.target.value) : null)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: 15"
            />
          </div>

          <div>
            <label
              htmlFor="brewDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              抽出日時
            </label>
            <input
              type="datetime-local"
              id="brewDate"
              name="brewDate"
              defaultValue={brewDateValue}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* 淹れた人 */}
        <div>
          <label
            htmlFor="brewedBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            淹れた人
          </label>
          <input
            type="text"
            id="brewedBy"
            name="brewedBy"
            defaultValue={tasting.brewedBy || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="名前を入力"
          />
        </div>
        {/* 抽出メモ */}
        <div>
          <label
            htmlFor="brewNotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            抽出メモ
          </label>
          <textarea
            id="brewNotes"
            name="brewNotes"
            rows={3}
            defaultValue={tasting.brewNotes || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="湯温、蒸らし時間、注ぎ方など"
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

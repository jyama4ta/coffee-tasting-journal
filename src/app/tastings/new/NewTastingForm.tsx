"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import GrindSizeSlider from "@/components/GrindSizeSlider";
import ImageUpload from "@/components/ImageUpload";
import { getNowForDatetimeLocal } from "@/lib/dateUtils";

interface Bean {
  id: number;
  name: string;
  status: string;
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

export default function NewTastingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [drippers, setDrippers] = useState<Dripper[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 挽き目のState（デフォルト: 5.0）
  const [grindSize, setGrindSize] = useState<number | null>(5.0);

  // 画像パスのState
  const [imagePath, setImagePath] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const brewDateValue = formData.get("brewDate") as string;
    const data = {
      coffeeBeanId: parseInt(formData.get("coffeeBeanId") as string, 10),
      dripperId: formData.get("dripperId")
        ? parseInt(formData.get("dripperId") as string, 10)
        : null,
      filterId: formData.get("filterId")
        ? parseInt(formData.get("filterId") as string, 10)
        : null,
      grindSize,
      brewDate: brewDateValue || getNowForDatetimeLocal(),
      imagePath,
      brewedBy: (formData.get("brewedBy") as string) || null,
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
            コーヒー豆 <span className="text-red-500">*</span>
          </label>
          <select
            id="coffeeBeanId"
            name="coffeeBeanId"
            required
            defaultValue={defaultBeanId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">選択してください</option>
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
          {beans.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              在庫中のコーヒー豆がありません。先に
              <a href="/beans/new" className="text-amber-600 hover:underline">
                コーヒー豆を登録
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
            抽出日時
          </label>
          <input
            type="datetime-local"
            id="brewDate"
            name="brewDate"
            defaultValue={getNowForDatetimeLocal()}
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="名前を入力"
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

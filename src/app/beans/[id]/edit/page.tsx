"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import StarRating from "@/components/StarRating";
import { ROAST_LEVELS, PROCESSES, BEAN_TYPES } from "@/lib/constants";

interface Shop {
  id: number;
  name: string;
  brandName: string | null;
  displayName: string;
}

interface Bean {
  id: number;
  name: string;
  origin: string | null;
  roastLevel: string | null;
  process: string | null;
  isDecaf: boolean;
  beanType: string | null;
  acidityScore: number;
  bitternessScore: number;
  bodyScore: number;
  flavorScore: number;
  notes: string | null;
  url: string | null;
  purchaseDate: string | null;
  price: number | null;
  amount: number | null;
  shopId: number | null;
  imagePath: string | null;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditBeanPage({ params }: Props) {
  const router = useRouter();
  const [bean, setBean] = useState<Bean | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [acidityScore, setAcidityScore] = useState(0);
  const [bitternessScore, setBitternessScore] = useState(0);
  const [bodyScore, setBodyScore] = useState(0);
  const [flavorScore, setFlavorScore] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { id } = await params;
      try {
        const [beanRes, shopsRes] = await Promise.all([
          fetch(`/api/beans/${id}`),
          fetch("/api/shops"),
        ]);

        if (!beanRes.ok) {
          throw new Error("豆が見つかりません");
        }

        const beanData = await beanRes.json();
        setBean(beanData);
        setImagePath(beanData.imagePath);
        setAcidityScore(beanData.acidityScore ?? 0);
        setBitternessScore(beanData.bitternessScore ?? 0);
        setBodyScore(beanData.bodyScore ?? 0);
        setFlavorScore(beanData.flavorScore ?? 0);

        if (shopsRes.ok) {
          const shopsData = await shopsRes.json();
          setShops(shopsData);
        }
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
    if (!bean) return;

    setSaving(true);
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
      const response = await fetch(`/api/beans/${bean.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "更新に失敗しました");
      }

      router.push(`/beans/${bean.id}`);
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

  if (!bean) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-red-600">{error || "豆が見つかりません"}</p>
        <Button href="/beans" variant="outline" className="mt-4">
          豆一覧に戻る
        </Button>
      </div>
    );
  }

  const purchaseDateValue = bean.purchaseDate
    ? new Date(bean.purchaseDate).toISOString().split("T")[0]
    : "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🫘 豆編集</h1>
        <p className="text-gray-600">「{bean.name}」の情報を編集します</p>
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
              defaultValue={bean.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                defaultValue={bean.origin || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                defaultValue={bean.beanType || ""}
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
                defaultValue={bean.roastLevel || ""}
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
                defaultValue={bean.process || ""}
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
              defaultChecked={bean.isDecaf}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="isDecaf" className="ml-2 text-sm text-gray-700">
              デカフェ
            </label>
          </div>
        </div>

        {/* 味わいの特徴 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
            味わいの特徴
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
              defaultValue={bean.shopId || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択なし</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.displayName}
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
                defaultValue={purchaseDateValue}
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
                defaultValue={bean.price || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                defaultValue={bean.amount || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            defaultValue={bean.url || ""}
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
            defaultValue={bean.notes || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存する"}
          </Button>
          <Button href={`/beans/${bean.id}`} variant="outline">
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import ImageUpload from "@/components/ImageUpload";
import { FILTER_TYPES, EQUIPMENT_SIZES } from "@/lib/constants";

export default function NewFilterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: (formData.get("type") as string) || null,
      notes: (formData.get("notes") as string) || null,
      url: (formData.get("url") as string) || null,
      size: (formData.get("size") as string) || null,
      imagePath,
    };

    try {
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "登録に失敗しました");
      }

      router.push("/admin/filters");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/admin" className="hover:text-gray-900">
          管理画面
        </Link>
        <span>/</span>
        <Link href="/admin/filters" className="hover:text-gray-900">
          フィルター一覧
        </Link>
        <span>/</span>
        <span className="text-gray-900">新規登録</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 フィルター登録</h1>
        <p className="text-gray-600">新しいフィルターを登録します</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            フィルター名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例: HARIO V60ペーパー"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            種類
          </label>
          <select
            id="type"
            name="type"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {FILTER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

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
            placeholder="https://www.hario.co.jp/filter.html"
          />
        </div>

        <div>
          <label
            htmlFor="size"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            サイズ
          </label>
          <select
            id="size"
            name="size"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {EQUIPMENT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

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
            placeholder="特記事項など"
          />
        </div>

        <ImageUpload
          category="filters"
          currentImagePath={imagePath}
          onImageChange={setImagePath}
          label="フィルター画像"
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </Button>
          <Button href="/admin/filters" variant="outline">
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

export default function NewShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: (formData.get("name") as string) || "",
      branchName: (formData.get("branchName") as string) || null,
      address: (formData.get("address") as string) || null,
      url: (formData.get("url") as string) || null,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      const response = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "登録に失敗しました");
      }

      router.push("/admin/shops");
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
        <Link href="/admin/shops" className="hover:text-gray-900">
          店舗一覧
        </Link>
        <span>/</span>
        <span className="text-gray-900">新規登録</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🏪 店舗登録</h1>
        <p className="text-gray-600">新しい購入店舗を登録します</p>
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
            店舗名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例: やなか珈琲"
          />
          <p className="text-xs text-gray-500 mt-1">
            お店の名前を入力してください
          </p>
        </div>

        <div>
          <label
            htmlFor="branchName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            支店名
          </label>
          <input
            type="text"
            id="branchName"
            name="branchName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例: 谷中店"
          />
          <p className="text-xs text-gray-500 mt-1">
            チェーン店など支店がある場合に入力してください
          </p>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            住所
          </label>
          <input
            type="text"
            id="address"
            name="address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="例: 東京都渋谷区..."
          />
        </div>

        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Webサイト
          </label>
          <input
            type="url"
            id="url"
            name="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="https://..."
          />
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
            placeholder="営業時間や特記事項など"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "登録中..." : "登録する"}
          </Button>
          <Button href="/admin/shops" variant="outline">
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

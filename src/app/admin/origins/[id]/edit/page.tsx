"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type Origin = {
  id: number;
  name: string;
  notes: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditOriginPage({ params }: PageProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrigin = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/origins/${id}`);
        if (!response.ok) {
          throw new Error("産地が見つかりません");
        }
        const data = await response.json();
        setOrigin(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrigin();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!origin) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      const response = await fetch(`/api/origins/${origin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新に失敗しました");
      }

      router.push(`/admin/origins/${origin.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error && !origin) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">{error}</p>
        </div>
        <Button href="/admin/origins" variant="secondary">
          一覧に戻る
        </Button>
      </div>
    );
  }

  if (!origin) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/admin" className="hover:text-gray-900">
          管理画面
        </Link>
        <span>/</span>
        <Link href="/admin/origins" className="hover:text-gray-900">
          産地マスター一覧
        </Link>
        <span>/</span>
        <Link
          href={`/admin/origins/${origin.id}`}
          className="hover:text-gray-900"
        >
          {origin.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">編集</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🌍 産地を編集</h1>
        <p className="text-gray-600">産地「{origin.name}」の情報を編集します</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* 産地名 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              産地名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={origin.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="例: エチオピア"
            />
          </div>

          {/* メモ */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              メモ
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={origin.notes || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="例: アフリカ東部、コーヒー発祥の地"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button href={`/admin/origins/${origin.id}`} variant="secondary">
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "更新"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

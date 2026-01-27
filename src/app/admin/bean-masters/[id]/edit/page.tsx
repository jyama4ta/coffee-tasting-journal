"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

type Origin = {
  id: number;
  name: string;
};

type BeanMaster = {
  id: number;
  name: string;
  originId: number | null;
  origin: Origin | null;
  notes: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditBeanMasterPage({ params }: PageProps) {
  const router = useRouter();
  const [beanMaster, setBeanMaster] = useState<BeanMaster | null>(null);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      try {
        const [beanRes, originsRes] = await Promise.all([
          fetch(`/api/bean-masters/${id}`),
          fetch("/api/origins"),
        ]);
        if (!beanRes.ok) {
          throw new Error("銘柄が見つかりません");
        }
        const beanData = await beanRes.json();
        const originsData = await originsRes.json();
        setBeanMaster(beanData);
        setOrigins(originsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!beanMaster) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const originIdStr = formData.get("originId") as string;
    const data = {
      name: formData.get("name") as string,
      originId: originIdStr ? parseInt(originIdStr, 10) : null,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      const response = await fetch(`/api/bean-masters/${beanMaster.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新に失敗しました");
      }

      router.push(`/admin/bean-masters/${beanMaster.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!beanMaster) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error || "銘柄が見つかりません"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/admin" className="hover:text-gray-900">
          管理画面
        </Link>
        <span>/</span>
        <Link href="/admin/bean-masters" className="hover:text-gray-900">
          銘柄マスター一覧
        </Link>
        <span>/</span>
        <Link
          href={`/admin/bean-masters/${beanMaster.id}`}
          className="hover:text-gray-900"
        >
          {beanMaster.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">編集</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ☕ 銘柄マスター編集
        </h1>
        <p className="text-gray-600">{beanMaster.name}の情報を編集します</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              銘柄名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={beanMaster.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="originId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              産地
            </label>
            <select
              id="originId"
              name="originId"
              defaultValue={beanMaster.originId?.toString() || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択してください</option>
              {origins.map((origin) => (
                <option key={origin.id} value={origin.id}>
                  {origin.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              産地が見つからない場合は
              <Link
                href="/admin/origins/new"
                className="text-amber-600 hover:text-amber-700"
              >
                産地マスターから追加
              </Link>
              してください
            </p>
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
              defaultValue={beanMaster.notes || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存する"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

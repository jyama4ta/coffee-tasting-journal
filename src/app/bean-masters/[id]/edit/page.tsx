"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { ROAST_LEVELS, PROCESSES } from "@/lib/constants";

type BeanMaster = {
  id: number;
  name: string;
  origin: string | null;
  roastLevel: string | null;
  process: string | null;
  notes: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditBeanMasterPage({ params }: PageProps) {
  const router = useRouter();
  const [beanMaster, setBeanMaster] = useState<BeanMaster | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeanMaster = async () => {
      const { id } = await params;
      try {
        const response = await fetch(`/api/bean-masters/${id}`);
        if (!response.ok) {
          throw new Error("銘柄が見つかりません");
        }
        const data = await response.json();
        setBeanMaster(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBeanMaster();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!beanMaster) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      origin: formData.get("origin") as string || null,
      roastLevel: formData.get("roastLevel") as string || null,
      process: formData.get("process") as string || null,
      notes: formData.get("notes") as string || null,
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

      router.push(`/bean-masters/${beanMaster.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">☕ 銘柄マスター編集</h1>
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
              htmlFor="origin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              産地
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              defaultValue={beanMaster.origin || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="roastLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              デフォルト焙煎度
            </label>
            <select
              id="roastLevel"
              name="roastLevel"
              defaultValue={beanMaster.roastLevel || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択してください</option>
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
              デフォルト精製方法
            </label>
            <select
              id="process"
              name="process"
              defaultValue={beanMaster.process || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">選択してください</option>
              {PROCESSES.map((proc) => (
                <option key={proc.value} value={proc.value}>
                  {proc.label}
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

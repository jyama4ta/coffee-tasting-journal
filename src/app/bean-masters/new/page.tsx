"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { ROAST_LEVELS, PROCESSES } from "@/lib/constants";

export default function NewBeanMasterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      const response = await fetch("/api/bean-masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "登録に失敗しました");
      }

      router.push("/bean-masters");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">☕ 銘柄マスター新規登録</h1>
        <p className="text-gray-600">新しい銘柄を登録します</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: エチオピア イルガチェフェ"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="例: エチオピア"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
              placeholder="銘柄に関するメモ（任意）"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録する"}
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

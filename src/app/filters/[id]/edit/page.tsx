"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

interface Filter {
  id: number;
  name: string;
  type: string | null;
  notes: string | null;
}

const FILTER_TYPES = [
  { value: "", label: "選択なし" },
  { value: "PAPER", label: "ペーパー" },
  { value: "METAL", label: "金属" },
  { value: "CLOTH", label: "布" },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditFilterPage({ params }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFilter() {
      const { id } = await params;
      try {
        const response = await fetch(`/api/filters/${id}`);
        if (!response.ok) {
          throw new Error("フィルターが見つかりません");
        }
        const data = await response.json();
        setFilter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    }
    fetchFilter();
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!filter) return;

    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: (formData.get("type") as string) || null,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      const response = await fetch(`/api/filters/${filter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "更新に失敗しました");
      }

      router.push(`/filters/${filter.id}`);
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

  if (!filter) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-red-600">{error || "フィルターが見つかりません"}</p>
        <Button href="/filters" variant="outline" className="mt-4">
          フィルター一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 フィルター編集</h1>
        <p className="text-gray-600">「{filter.name}」の情報を編集します</p>
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
            defaultValue={filter.name}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            defaultValue={filter.type || ""}
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
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メモ
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={filter.notes || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存する"}
          </Button>
          <Button href={`/filters/${filter.id}`} variant="outline">
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

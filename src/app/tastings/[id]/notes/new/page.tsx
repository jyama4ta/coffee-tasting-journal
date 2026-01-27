"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";

const BODY_OPTIONS = [
  { value: "", label: "選択してください" },
  { value: "LIGHT", label: "軽い" },
  { value: "MEDIUM", label: "中程度" },
  { value: "HEAVY", label: "重い" },
];

const FLAVOR_TAGS = [
  { value: "BERRY", label: "ベリー" },
  { value: "CITRUS", label: "シトラス" },
  { value: "TROPICAL", label: "トロピカル" },
  { value: "STONE_FRUIT", label: "ストーンフルーツ" },
  { value: "CHOCOLATE", label: "チョコレート" },
  { value: "NUTTY", label: "ナッツ" },
  { value: "CARAMEL", label: "キャラメル" },
  { value: "HONEY", label: "はちみつ" },
  { value: "FLORAL", label: "フローラル" },
  { value: "SPICE", label: "スパイス" },
  { value: "HERBAL", label: "ハーブ" },
  { value: "EARTHY", label: "アーシー" },
];

export default function NewTastingNotePage() {
  const router = useRouter();
  const params = useParams();
  const tastingId = parseInt(params.id as string, 10);

  const [formData, setFormData] = useState({
    recordedBy: "",
    acidity: 0,
    bitterness: 0,
    sweetness: 0,
    body: "",
    aftertaste: 0,
    flavorTags: [] as string[],
    overallRating: 0,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFlavorTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      flavorTags: prev.flavorTags.includes(tag)
        ? prev.flavorTags.filter((t) => t !== tag)
        : [...prev.flavorTags, tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        tastingEntryId: tastingId,
        recordedBy: formData.recordedBy || null,
        acidity: formData.acidity || null,
        bitterness: formData.bitterness || null,
        sweetness: formData.sweetness || null,
        body: formData.body || null,
        aftertaste: formData.aftertaste || null,
        flavorTags:
          formData.flavorTags.length > 0
            ? JSON.stringify(formData.flavorTags)
            : null,
        overallRating: formData.overallRating || null,
        notes: formData.notes || null,
      };

      const response = await fetch("/api/tasting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "テイスティングノートの作成に失敗しました",
        );
      }

      router.push(`/tastings/${tastingId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/tastings" className="hover:text-gray-900">
          ドリップ記録一覧
        </Link>
        <span>/</span>
        <Link href={`/tastings/${tastingId}`} className="hover:text-gray-900">
          ドリップ記録詳細
        </Link>
        <span>/</span>
        <span className="text-gray-900">ノートを追加</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">
        📝 テイスティングノートを追加
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recorder Name */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            お名前
          </label>
          <input
            type="text"
            value={formData.recordedBy}
            onChange={(e) =>
              setFormData({ ...formData, recordedBy: e.target.value })
            }
            placeholder="例: 山田太郎"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Taste Ratings */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">味の評価</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                酸味
              </label>
              <StarRating
                value={formData.acidity}
                onChange={(value) =>
                  setFormData({ ...formData, acidity: value })
                }
                maxRating={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                苦味
              </label>
              <StarRating
                value={formData.bitterness}
                onChange={(value) =>
                  setFormData({ ...formData, bitterness: value })
                }
                maxRating={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                甘味
              </label>
              <StarRating
                value={formData.sweetness}
                onChange={(value) =>
                  setFormData({ ...formData, sweetness: value })
                }
                maxRating={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                後味
              </label>
              <StarRating
                value={formData.aftertaste}
                onChange={(value) =>
                  setFormData({ ...formData, aftertaste: value })
                }
                maxRating={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ボディ
              </label>
              <select
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                {BODY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Flavor Tags */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            フレーバータグ
          </h2>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_TAGS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => handleFlavorTagToggle(tag.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.flavorTags.includes(tag.value)
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Rating */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            総合評価
          </label>
          <StarRating
            value={formData.overallRating}
            onChange={(value) =>
              setFormData({ ...formData, overallRating: value })
            }
            maxRating={5}
            size="lg"
          />
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コメント
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            placeholder="このコーヒーの感想を書いてください..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "ノートを追加"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/tastings/${tastingId}`)}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}

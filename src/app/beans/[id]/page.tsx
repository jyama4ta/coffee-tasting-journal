import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import StatusButton from "./StatusButton";
import { prisma } from "@/lib/prisma";
import {
  ROAST_LEVEL_LABELS,
  PROCESS_LABELS,
  BEAN_TYPE_LABELS,
} from "@/lib/constants";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

// displayNameを生成するヘルパー関数
function getShopDisplayName(name: string, branchName: string | null): string {
  if (branchName) {
    return `${name} ${branchName}`;
  }
  return name;
}

// コーヒー豆アイコンコンポーネント
function BeanIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="12"
        cy="12"
        rx="6"
        ry="9"
        fill={filled ? "#92400e" : "none"}
        stroke={filled ? "#78350f" : "#d1d5db"}
        strokeWidth="1.5"
      />
      <path
        d="M12 4c0 4-2.5 6-2.5 8s2.5 4 2.5 8"
        fill="none"
        stroke={filled ? "#78350f" : "#d1d5db"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 評価スコアを豆アイコンで表示するコンポーネント
function BeanScoreDisplay({ label, score }: { label: string; score: number }) {
  const safeScore = Math.max(0, Math.min(score ?? 0, 5));

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div
        className="flex items-center gap-0.5"
        aria-label={`${label}: ${safeScore}/5`}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <BeanIcon key={value} filled={value <= safeScore} />
        ))}
        <span className="text-xs text-gray-500 ml-2">{safeScore}/5</span>
      </div>
    </div>
  );
}

async function getBean(id: number) {
  return prisma.coffeeBean.findUnique({
    where: { id },
    include: {
      shop: true,
      tastingEntries: {
        orderBy: { brewDate: "desc" },
        take: 10,
      },
    },
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BeanDetailPage({ params }: Props) {
  const { id } = await params;
  const beanId = parseInt(id, 10);

  if (isNaN(beanId)) {
    notFound();
  }

  const bean = await getBean(beanId);

  if (!bean) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">🫘 {bean.name}</h1>
            {bean.isDecaf && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                デカフェ
              </span>
            )}
          </div>
          <p className="text-gray-600">豆詳細</p>
        </div>
        <div
          className="flex flex-col sm:flex-row gap-2"
          data-testid="action-buttons"
        >
          <StatusButton beanId={bean.id} currentStatus={bean.status} />
          <Button href={`/beans/${bean.id}/edit`} variant="outline">
            編集
          </Button>
          <DeleteButton beanId={bean.id} beanName={bean.name} />
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-lg p-4 ${
          bean.status === "IN_STOCK"
            ? "bg-green-50 border border-green-200"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                bean.status === "IN_STOCK"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {bean.status === "IN_STOCK" ? "📦 在庫中" : "✓ 飲み切り"}
            </span>
            {bean.finishedDate && (
              <span className="text-sm text-gray-500">
                ({new Date(bean.finishedDate).toLocaleDateString("ja-JP")}{" "}
                に飲み切り)
              </span>
            )}
          </div>
          {bean.status === "IN_STOCK" && (
            <Button href={`/tastings/new?beanId=${bean.id}`} size="sm">
              + 試飲記録を追加
            </Button>
          )}
        </div>
      </div>

      {/* Bean Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>

        {/* 画像表示 */}
        {bean.imagePath && (
          <div className="mb-6">
            <img
              src={`/api/images/${bean.imagePath.replace("/images/", "")}`}
              alt={bean.name}
              className="max-w-md max-h-64 rounded-lg border border-gray-200 object-contain"
            />
          </div>
        )}

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">銘柄</dt>
            <dd className="mt-1 text-gray-900">{bean.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">産地</dt>
            <dd className="mt-1 text-gray-900">{bean.origin || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">タイプ</dt>
            <dd className="mt-1 text-gray-900">
              {bean.beanType
                ? BEAN_TYPE_LABELS[bean.beanType] || bean.beanType
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">焙煎度</dt>
            <dd className="mt-1 text-gray-900">
              {bean.roastLevel
                ? ROAST_LEVEL_LABELS[bean.roastLevel] || bean.roastLevel
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">精製方法</dt>
            <dd className="mt-1 text-gray-900">
              {bean.process
                ? PROCESS_LABELS[bean.process] || bean.process
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">購入店</dt>
            <dd className="mt-1">
              {bean.shop ? (
                <Link
                  href={`/shops/${bean.shop.id}`}
                  className="text-amber-600 hover:text-amber-800"
                >
                  {getShopDisplayName(bean.shop.name, bean.shop.branchName)}
                </Link>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">購入日</dt>
            <dd className="mt-1 text-gray-900">
              {bean.purchaseDate
                ? new Date(bean.purchaseDate).toLocaleDateString("ja-JP")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">価格 / 量</dt>
            <dd className="mt-1 text-gray-900">
              {bean.price ? `¥${bean.price.toLocaleString()}` : "-"}
              {bean.amount ? ` / ${bean.amount}g` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">商品ページURL</dt>
            <dd className="mt-1">
              {bean.url ? (
                <a
                  href={bean.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  🔗 {bean.url}
                </a>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">メモ</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">
              {bean.notes || "-"}
            </dd>
          </div>
        </dl>

        {/* 味わいの特徴セクション */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            味わいの特徴
          </h3>
          <div className="space-y-1 max-w-md">
            <BeanScoreDisplay label="酸味" score={bean.acidityScore} />
            <BeanScoreDisplay label="苦味" score={bean.bitternessScore} />
            <BeanScoreDisplay label="コク" score={bean.bodyScore} />
            <BeanScoreDisplay label="風味" score={bean.flavorScore} />
          </div>
        </div>
      </div>

      {/* Related Tastings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">試飲記録</h2>
          {bean.status === "IN_STOCK" && (
            <Button
              href={`/tastings/new?beanId=${bean.id}`}
              size="sm"
              variant="outline"
            >
              + 追加
            </Button>
          )}
        </div>

        {bean.tastingEntries.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {bean.tastingEntries.map((tasting) => (
              <li key={tasting.id} className="py-3">
                <Link
                  href={`/tastings/${tasting.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {new Date(tasting.brewDate).toLocaleDateString("ja-JP")}
                    </span>
                    {tasting.grindSize && (
                      <span className="ml-2 text-sm text-gray-500">
                        挽き目: {tasting.grindSize.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {tasting.overallRating && (
                    <span className="text-amber-500">
                      {"★".repeat(tasting.overallRating)}
                      {"☆".repeat(5 - tasting.overallRating)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">
            まだ試飲記録がありません
          </p>
        )}
      </div>

      {/* Back Link */}
      <div>
        <Link href="/beans" className="text-amber-600 hover:text-amber-800">
          ← 豆一覧に戻る
        </Link>
      </div>
    </div>
  );
}

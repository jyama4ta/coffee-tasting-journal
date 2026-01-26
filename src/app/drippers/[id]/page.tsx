import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import { prisma } from "@/lib/prisma";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

async function getDripper(id: number) {
  return prisma.dripper.findUnique({
    where: { id },
    include: {
      tastingEntries: {
        orderBy: { brewDate: "desc" },
        take: 10,
        include: {
          coffeeBean: true,
        },
      },
    },
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DripperDetailPage({ params }: Props) {
  const { id } = await params;
  const dripperId = parseInt(id, 10);

  if (isNaN(dripperId)) {
    notFound();
  }

  const dripper = await getDripper(dripperId);

  if (!dripper) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🫖 {dripper.name}
          </h1>
          <p className="text-gray-600">ドリッパー詳細</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/drippers/${dripper.id}/edit`} variant="outline">
            編集
          </Button>
          <DeleteButton dripperId={dripper.id} dripperName={dripper.name} />
        </div>
      </div>

      {/* Dripper Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>

        {/* 画像表示 */}
        {dripper.imagePath && (
          <div className="mb-6">
            <img
              src={`/api/images/${dripper.imagePath.replace("/images/", "")}`}
              alt={dripper.name}
              className="max-w-md max-h-64 rounded-lg border border-gray-200 object-contain"
            />
          </div>
        )}

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">ドリッパー名</dt>
            <dd className="mt-1 text-gray-900">{dripper.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">メーカー</dt>
            <dd className="mt-1 text-gray-900">
              {dripper.manufacturer || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">使用回数</dt>
            <dd className="mt-1 text-gray-900">
              {dripper.tastingEntries.length} 回
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">登録日</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(dripper.createdAt).toLocaleDateString("ja-JP")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">商品ページURL</dt>
            <dd className="mt-1">
              {dripper.url ? (
                <a
                  href={dripper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  🔗 {dripper.url}
                </a>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">メモ</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">
              {dripper.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Related Tastings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          このドリッパーを使用した試飲記録
        </h2>

        {dripper.tastingEntries.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {dripper.tastingEntries.map((tasting) => (
              <li key={tasting.id} className="py-3">
                <Link
                  href={`/tastings/${tasting.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {tasting.coffeeBean.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(tasting.brewDate).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {tasting.overallRating && (
                    <span className="text-amber-500">
                      {"★".repeat(tasting.overallRating)}
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
        <Link href="/drippers" className="text-amber-600 hover:text-amber-800">
          ← ドリッパー一覧に戻る
        </Link>
      </div>
    </div>
  );
}

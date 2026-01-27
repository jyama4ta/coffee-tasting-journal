import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import { prisma } from "@/lib/prisma";
import { FILTER_TYPE_LABELS, EQUIPMENT_SIZE_LABELS } from "@/lib/constants";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

async function getFilter(id: number) {
  return prisma.filter.findUnique({
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

export default async function FilterDetailPage({ params }: Props) {
  const { id } = await params;
  const filterId = parseInt(id, 10);

  if (isNaN(filterId)) {
    notFound();
  }

  const filter = await getFilter(filterId);

  if (!filter) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/filters" className="hover:text-gray-900">
          フィルター一覧
        </Link>
        <span>/</span>
        <span className="text-gray-900">{filter.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📄 {filter.name}</h1>
          <p className="text-gray-600">フィルター詳細</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/filters/${filter.id}/edit`} variant="outline">
            編集
          </Button>
          <DeleteButton filterId={filter.id} filterName={filter.name} />
        </div>
      </div>

      {/* Filter Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>

        {/* 画像表示 */}
        {filter.imagePath && (
          <div className="mb-6">
            <img
              src={`/api/images/${filter.imagePath.replace("/images/", "")}`}
              alt={filter.name}
              className="max-w-md max-h-64 rounded-lg border border-gray-200 object-contain"
            />
          </div>
        )}

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">フィルター名</dt>
            <dd className="mt-1 text-gray-900">{filter.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">種類</dt>
            <dd className="mt-1 text-gray-900">
              {filter.type
                ? FILTER_TYPE_LABELS[filter.type] || filter.type
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">サイズ</dt>
            <dd className="mt-1 text-gray-900">
              {filter.size
                ? EQUIPMENT_SIZE_LABELS[filter.size] || filter.size
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">使用回数</dt>
            <dd className="mt-1 text-gray-900">
              {filter.tastingEntries.length} 回
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">登録日</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(filter.createdAt).toLocaleDateString("ja-JP")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">商品ページURL</dt>
            <dd className="mt-1">
              {filter.url ? (
                <a
                  href={filter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  🔗 {filter.url}
                </a>
              ) : (
                <span className="text-gray-900">-</span>
              )}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">メモ</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">
              {filter.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Related Tastings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          このフィルターを使用した試飲記録
        </h2>

        {filter.tastingEntries.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filter.tastingEntries.map((tasting) => (
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
        <Link href="/filters" className="text-amber-600 hover:text-amber-800">
          ← フィルター一覧に戻る
        </Link>
      </div>
    </div>
  );
}

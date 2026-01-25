import Link from "next/link";
import Button from "@/components/Button";
import { prisma } from "@/lib/prisma";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

const FILTER_TYPE_LABELS: Record<string, string> = {
  PAPER: "ペーパー",
  METAL: "金属",
  CLOTH: "布",
};

async function getFilters() {
  return prisma.filter.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tastingEntries: true },
      },
    },
  });
}

export default async function FiltersPage() {
  const filters = await getFilters();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📄 フィルター一覧
          </h1>
          <p className="text-gray-600">使用するフィルターを管理</p>
        </div>
        <Button href="/filters/new">+ 新規登録</Button>
      </div>

      {/* List */}
      {filters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filters.map((filter) => (
            <Link
              key={filter.id}
              href={`/filters/${filter.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">📄</span>
                <div className="flex items-center gap-2">
                  {filter.type && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {FILTER_TYPE_LABELS[filter.type] || filter.type}
                    </span>
                  )}
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {filter._count.tastingEntries} 回使用
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {filter.name}
              </h3>
              {filter.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {filter.notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">まだフィルターが登録されていません</p>
          <Button href="/filters/new">最初のフィルターを登録</Button>
        </div>
      )}
    </div>
  );
}

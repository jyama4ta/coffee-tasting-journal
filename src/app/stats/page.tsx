import { prisma } from "@/lib/prisma";
import Card from "@/components/Card";
import Link from "next/link";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

async function getStats() {
  const [
    shopsCount,
    drippersCount,
    filtersCount,
    beansCount,
    inStockBeansCount,
    tastingsCount,
    notesCount,
    avgRating,
  ] = await Promise.all([
    prisma.shop.count(),
    prisma.dripper.count(),
    prisma.filter.count(),
    prisma.coffeeBean.count(),
    prisma.coffeeBean.count({ where: { status: "IN_STOCK" } }),
    prisma.tastingEntry.count(),
    prisma.tastingNote.count(),
    prisma.tastingNote.aggregate({
      _avg: { overallRating: true },
    }),
  ]);

  // よく使う豆 TOP3
  const topBeans = await prisma.coffeeBean.findMany({
    take: 3,
    orderBy: {
      tastingEntries: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: { tastingEntries: true },
      },
    },
  });

  return {
    shopsCount,
    drippersCount,
    filtersCount,
    beansCount,
    inStockBeansCount,
    tastingsCount,
    notesCount,
    avgRating: avgRating._avg.overallRating,
    topBeans,
  };
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* ページタイトル */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📊 統計</h1>
      </div>

      {/* 基本統計カード */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📈 概要</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card
            href="/tastings"
            icon="📝"
            title="ドリップ記録"
            description="全ての記録"
            count={stats.tastingsCount}
          />
          <Card
            href="/beans"
            icon="🫘"
            title="コーヒー豆"
            description="登録済み"
            count={stats.beansCount}
          />
          <Card
            href="/beans?status=IN_STOCK"
            icon="📦"
            title="在庫中"
            description="今ある豆"
            count={stats.inStockBeansCount}
            color="bg-green-50"
          />
          <Card
            href="/shops"
            icon="🏪"
            title="店舗"
            description="購入店"
            count={stats.shopsCount}
          />
          <Card
            href="/drippers"
            icon="🫖"
            title="ドリッパー"
            description="器具"
            count={stats.drippersCount}
          />
          <Card
            href="/filters"
            icon="📄"
            title="フィルター"
            description="器具"
            count={stats.filtersCount}
          />
        </div>
      </section>

      {/* テイスティング統計 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          ☕ テイスティング統計
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {stats.notesCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              テイスティングノート
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {stats.avgRating ? stats.avgRating.toFixed(1) : "-"}
            </div>
            <div className="text-sm text-gray-500 mt-1">平均評価</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {stats.tastingsCount > 0
                ? (stats.notesCount / stats.tastingsCount).toFixed(1)
                : "-"}
            </div>
            <div className="text-sm text-gray-500 mt-1">ノート/ドリップ</div>
          </div>
        </div>
      </section>

      {/* よく使う豆ランキング */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          🏆 よく使うコーヒー豆 TOP3
        </h2>
        {stats.topBeans.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    コーヒー豆
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ドリップ回数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topBeans.map((bean, index) => (
                  <tr key={bean.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/beans/${bean.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium"
                      >
                        {bean.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                      {bean._count.tastingEntries}回
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            まだドリップ記録がありません
          </div>
        )}
      </section>
    </div>
  );
}

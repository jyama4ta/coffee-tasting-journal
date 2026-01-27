import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import Button from "@/components/Button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTimeShort } from "@/lib/dateUtils";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

async function getStats() {
  const [
    shopsCount,
    drippersCount,
    filtersCount,
    beansCount,
    tastingsCount,
    inStockBeansCount,
  ] = await Promise.all([
    prisma.shop.count(),
    prisma.dripper.count(),
    prisma.filter.count(),
    prisma.coffeeBean.count(),
    prisma.tastingEntry.count(),
    prisma.coffeeBean.count({ where: { status: "IN_STOCK" } }),
  ]);

  // 最近の試飲記録
  const recentTastings = await prisma.tastingEntry.findMany({
    take: 5,
    orderBy: { brewDate: "desc" },
    include: {
      coffeeBean: true,
    },
  });

  return {
    shopsCount,
    drippersCount,
    filtersCount,
    beansCount,
    tastingsCount,
    inStockBeansCount,
    recentTastings,
  };
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Cards */}
      <StatsSection stats={stats} />

      {/* Recent Tastings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            🕐 最近のドリップ記録
          </h2>
          <Button href="/tastings" variant="outline" size="sm">
            すべて見る →
          </Button>
        </div>

        {stats.recentTastings.length > 0 ? (
          <>
            {/* デスクトップ: テーブル表示 */}
            <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コーヒー豆
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentTastings.map((tasting) => (
                    <tr key={tasting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTimeShort(tasting.brewDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tasting.coffeeBean.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* モバイル: カード表示 */}
            <div className="sm:hidden space-y-3">
              {stats.recentTastings.map((tasting) => (
                <Link
                  key={tasting.id}
                  href={`/tastings/${tasting.id}`}
                  className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">
                      {tasting.coffeeBean.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTimeShort(tasting.brewDate)}
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="mb-4">まだドリップ記録がありません</p>
            <Button href="/tastings/new">最初の記録を追加</Button>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          ⚡ クイックアクション
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Button href="/tastings/new" className="justify-start">
            📝 ドリップ記録を追加
          </Button>
          <Button
            href="/beans/new"
            variant="secondary"
            className="justify-start"
          >
            🫘 コーヒー豆を登録
          </Button>
          <Button
            href="/shops/new"
            variant="secondary"
            className="justify-start"
          >
            🏪 店舗を登録
          </Button>
          <Button
            href="/drippers/new"
            variant="secondary"
            className="justify-start"
          >
            🫖 ドリッパーを登録
          </Button>
        </div>
      </section>
    </div>
  );
}

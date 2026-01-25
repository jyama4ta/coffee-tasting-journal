import Card from "@/components/Card";
import Button from "@/components/Button";
import { prisma } from "@/lib/prisma";

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
      <section className="bg-linear-to-r from-amber-800 to-amber-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">☕ Coffee Tasting Journal</h1>
        <p className="text-amber-100 mb-6">
          ハンドドリップコーヒーの試飲記録を管理しましょう
        </p>
        <div className="flex gap-4">
          <Button href="/tastings/new" variant="outline-light">
            + 試飲記録を追加
          </Button>
          <Button href="/beans/new" variant="outline-light">
            + 豆を追加
          </Button>
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 統計</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card
            href="/tastings"
            icon="📝"
            title="試飲記録"
            description="全ての記録"
            count={stats.tastingsCount}
          />
          <Card
            href="/beans"
            icon="🫘"
            title="豆"
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

      {/* Recent Tastings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🕐 最近の試飲記録
          </h2>
          <Button href="/tastings" variant="outline" size="sm">
            すべて見る →
          </Button>
        </div>

        {stats.recentTastings.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    豆
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    評価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メモ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentTastings.map((tasting) => (
                  <tr key={tasting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tasting.brewDate).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tasting.coffeeBean.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tasting.overallRating ? (
                        <span className="text-amber-500">
                          {"★".repeat(tasting.overallRating)}
                          {"☆".repeat(5 - tasting.overallRating)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {tasting.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p className="mb-4">まだ試飲記録がありません</p>
            <Button href="/tastings/new">最初の記録を追加</Button>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          ⚡ クイックアクション
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button href="/tastings/new" className="justify-start">
            📝 試飲記録を追加
          </Button>
          <Button
            href="/beans/new"
            variant="secondary"
            className="justify-start"
          >
            🫘 豆を登録
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

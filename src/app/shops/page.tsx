import Link from "next/link";
import Button from "@/components/Button";
import { prisma } from "@/lib/prisma";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

async function getShops() {
  return prisma.shop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { coffeeBeans: true },
      },
    },
  });
}

export default async function ShopsPage() {
  const shops = await getShops();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏪 店舗一覧</h1>
          <p className="text-gray-600">コーヒー豆の購入店舗を管理</p>
        </div>
        <Button href="/shops/new">+ 新規登録</Button>
      </div>

      {/* List */}
      {shops.length > 0 ? (
        <>
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-4" data-testid="shops-cards">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {shop.name}
                    </span>
                    {shop.url && (
                      <span className="text-gray-400" title="Webサイトあり">
                        🔗
                      </span>
                    )}
                  </div>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {shop._count.coffeeBeans} 種
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  {shop.address && <p>📍 {shop.address}</p>}
                  {shop.notes && (
                    <p className="line-clamp-2">📝 {shop.notes}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div
            className="hidden md:block bg-white rounded-lg shadow overflow-hidden"
            data-testid="shops-table"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録豆数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メモ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/shops/${shop.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium"
                      >
                        {shop.name}
                      </Link>
                      {shop.url && (
                        <a
                          href={shop.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Webサイトを開く"
                        >
                          🔗
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {shop.address || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                        {shop._count.coffeeBeans} 種
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {shop.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/shops/${shop.id}/edit`}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">まだ店舗が登録されていません</p>
          <Button href="/shops/new">最初の店舗を登録</Button>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import Button from "@/components/Button";
import { prisma } from "@/lib/prisma";

const ROAST_LEVEL_LABELS: Record<string, string> = {
  LIGHT: "ライトロースト",
  CINNAMON: "シナモンロースト",
  MEDIUM: "ミディアムロースト",
  HIGH: "ハイロースト",
  CITY: "シティロースト",
  FULL_CITY: "フルシティロースト",
  FRENCH: "フレンチロースト",
  ITALIAN: "イタリアンロースト",
};

async function getBeans(status?: string) {
  const where = status ? { status: status as "IN_STOCK" | "FINISHED" } : {};
  return prisma.coffeeBean.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      shop: true,
      _count: {
        select: { tastingEntries: true },
      },
    },
  });
}

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function BeansPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const beans = await getBeans(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🫘 豆一覧</h1>
          <p className="text-gray-600">コーヒー豆を管理</p>
        </div>
        <Button href="/beans/new">+ 新規登録</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Link
          href="/beans"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !status
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          すべて
        </Link>
        <Link
          href="/beans?status=IN_STOCK"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            status === "IN_STOCK"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          在庫中
        </Link>
        <Link
          href="/beans?status=FINISHED"
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            status === "FINISHED"
              ? "bg-gray-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          飲み切り
        </Link>
      </div>

      {/* List */}
      {beans.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  銘柄
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  産地
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  焙煎度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  購入店
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  試飲数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beans.map((bean) => (
                <tr key={bean.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/beans/${bean.id}`}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      {bean.name}
                    </Link>
                    {bean.isDecaf && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        デカフェ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {bean.origin || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {bean.roastLevel
                      ? ROAST_LEVEL_LABELS[bean.roastLevel] || bean.roastLevel
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {bean.shop ? (
                      <Link
                        href={`/shops/${bean.shop.id}`}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        {bean.shop.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                      {bean._count.tastingEntries} 回
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bean.status === "IN_STOCK"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {bean.status === "IN_STOCK" ? "在庫中" : "飲み切り"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/beans/${bean.id}/edit`}
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
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">
            {status === "IN_STOCK"
              ? "在庫中の豆がありません"
              : status === "FINISHED"
                ? "飲み切った豆がありません"
                : "まだ豆が登録されていません"}
          </p>
          <Button href="/beans/new">豆を登録</Button>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Button from "@/components/Button";

// 常に最新のデータを取得する
export const dynamic = "force-dynamic";

async function getBeanMasters() {
  return await prisma.beanMaster.findMany({
    orderBy: { name: "asc" },
    include: {
      origin: true,
      _count: {
        select: { coffeeBeans: true },
      },
    },
  });
}

export default async function BeanMastersPage() {
  const beanMasters = await getBeanMasters();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin" className="hover:text-amber-600">
              管理画面
            </Link>
            <span>/</span>
            <span>銘柄マスター</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">☕ 銘柄マスター</h1>
          <p className="text-gray-600">同じ銘柄の購入記録を名寄せして管理</p>
        </div>
        <Button href="/admin/bean-masters/new">+ 新規登録</Button>
      </div>

      {beanMasters.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            銘柄マスターが登録されていません。
            <br />
            「新規登録」ボタンから銘柄を追加してください。
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-4">
            {beanMasters.map((master) => (
              <Link
                key={master.id}
                href={`/admin/bean-masters/${master.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {master.name}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {master._count.coffeeBeans} 件
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  {master.origin && <p>🌍 {master.origin.name}</p>}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    銘柄名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    産地
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    購入記録
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {beanMasters.map((master) => (
                  <tr key={master.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/bean-masters/${master.id}`}
                        className="text-amber-600 hover:text-amber-800 font-medium"
                      >
                        {master.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {master.origin?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {master._count.coffeeBeans} 件
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

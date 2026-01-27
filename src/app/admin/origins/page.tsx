import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Button from "@/components/Button";
import { formatDate } from "@/lib/dateUtils";

async function getOrigins() {
  return await prisma.originMaster.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function OriginsListPage() {
  const origins = await getOrigins();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/admin" className="hover:text-gray-900">
          管理画面
        </Link>
        <span>/</span>
        <span className="text-gray-900">産地マスター一覧</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🌍 産地マスター一覧
          </h1>
          <p className="text-gray-600">
            {origins.length > 0
              ? `${origins.length}件の産地`
              : "産地を管理できます"}
          </p>
        </div>
        <Button href="/admin/origins/new">新規登録</Button>
      </div>

      {/* Content */}
      {origins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">登録されている産地がありません</p>
          <Button href="/admin/origins/new">最初の産地を登録</Button>
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="md:hidden space-y-4">
            {origins.map((origin) => (
              <Link
                key={origin.id}
                href={`/admin/origins/${origin.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {origin.name}
                    </h3>
                    {origin.notes && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {origin.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-400">→</span>
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
                    産地名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メモ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {origins.map((origin) => (
                  <tr key={origin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/origins/${origin.id}`}
                        className="font-medium text-amber-600 hover:text-amber-800"
                      >
                        {origin.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 line-clamp-1">
                        {origin.notes || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(origin.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/origins/${origin.id}/edit`}
                        className="text-amber-600 hover:text-amber-800"
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
      )}
    </div>
  );
}

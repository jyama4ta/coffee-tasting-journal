import Link from "next/link";
import Button from "@/components/Button";
import { prisma } from "@/lib/prisma";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

async function getDrippers() {
  return prisma.dripper.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tastingEntries: true },
      },
    },
  });
}

export default async function DrippersPage() {
  const drippers = await getDrippers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🫖 ドリッパー一覧
          </h1>
          <p className="text-gray-600">使用するドリッパーを管理</p>
        </div>
        <Button href="/drippers/new">+ 新規登録</Button>
      </div>

      {/* List */}
      {drippers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drippers.map((dripper) => (
            <Link
              key={dripper.id}
              href={`/drippers/${dripper.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🫖</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                  {dripper._count.tastingEntries} 回使用
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {dripper.name}
              </h3>
              {dripper.manufacturer && (
                <p className="text-sm text-gray-500 mb-2">
                  {dripper.manufacturer}
                </p>
              )}
              {dripper.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {dripper.notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">まだドリッパーが登録されていません</p>
          <Button href="/drippers/new">最初のドリッパーを登録</Button>
        </div>
      )}
    </div>
  );
}

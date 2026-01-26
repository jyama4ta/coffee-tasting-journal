import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import {
  ROAST_LEVEL_LABELS,
  PROCESS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/dateUtils";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getBeanMaster(id: number) {
  return await prisma.beanMaster.findUnique({
    where: { id },
    include: {
      coffeeBeans: {
        include: {
          shop: true,
          _count: { select: { tastingEntries: true } },
        },
        orderBy: { purchaseDate: "desc" },
      },
      _count: { select: { coffeeBeans: true } },
    },
  });
}

export default async function BeanMasterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    notFound();
  }

  const beanMaster = await getBeanMaster(parsedId);

  if (!beanMaster) {
    notFound();
  }

  const canDelete = beanMaster._count.coffeeBeans === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">☕ {beanMaster.name}</h1>
          <p className="text-gray-600">銘柄マスター詳細</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/bean-masters/${beanMaster.id}/edit`} variant="secondary">
            編集
          </Button>
          <DeleteButton id={beanMaster.id} disabled={!canDelete} />
        </div>
      </div>

      {/* Detail Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">銘柄名</dt>
            <dd className="mt-1 text-gray-900">{beanMaster.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">産地</dt>
            <dd className="mt-1 text-gray-900">{beanMaster.origin || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">デフォルト焙煎度</dt>
            <dd className="mt-1 text-gray-900">
              {beanMaster.roastLevel
                ? ROAST_LEVEL_LABELS[beanMaster.roastLevel]
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">デフォルト精製方法</dt>
            <dd className="mt-1 text-gray-900">
              {beanMaster.process
                ? PROCESS_LABELS[beanMaster.process]
                : "-"}
            </dd>
          </div>
          {beanMaster.notes && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">メモ</dt>
              <dd className="mt-1 text-gray-900 whitespace-pre-wrap">
                {beanMaster.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            購入履歴 ({beanMaster._count.coffeeBeans}件)
          </h2>
          <Button href={`/beans/new?beanMasterId=${beanMaster.id}`} size="sm">
            + この銘柄で購入記録を追加
          </Button>
        </div>

        {beanMaster.coffeeBeans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">購入履歴がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    購入日
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    購入店
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    焙煎度
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    量
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    価格
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    試飲
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {beanMaster.coffeeBeans.map((bean) => (
                  <tr key={bean.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <Link
                        href={`/beans/${bean.id}`}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        {bean.purchaseDate
                          ? formatDate(bean.purchaseDate)
                          : "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {bean.shop?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {bean.roastLevel
                        ? ROAST_LEVEL_LABELS[bean.roastLevel]
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {bean.amount ? `${bean.amount}g` : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {bean.price ? `¥${bean.price.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {bean._count.tastingEntries}件
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button href="/bean-masters" variant="secondary">
          ← 銘柄一覧に戻る
        </Button>
      </div>
    </div>
  );
}

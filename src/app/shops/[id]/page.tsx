import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import { prisma } from "@/lib/prisma";

async function getShop(id: number) {
  return prisma.shop.findUnique({
    where: { id },
    include: {
      coffeeBeans: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params;
  const shopId = parseInt(id, 10);

  if (isNaN(shopId)) {
    notFound();
  }

  const shop = await getShop(shopId);

  if (!shop) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏪 {shop.name}</h1>
          <p className="text-gray-600">店舗詳細</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/shops/${shop.id}/edit`} variant="outline">
            編集
          </Button>
          <DeleteButton shopId={shop.id} shopName={shop.name} />
        </div>
      </div>

      {/* Shop Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">店舗名</dt>
            <dd className="mt-1 text-gray-900">{shop.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">住所</dt>
            <dd className="mt-1 text-gray-900">{shop.address || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Webサイト</dt>
            <dd className="mt-1">
              {shop.url ? (
                <a
                  href={shop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-800"
                >
                  {shop.url} 🔗
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">登録日</dt>
            <dd className="mt-1 text-gray-900">
              {new Date(shop.createdAt).toLocaleDateString("ja-JP")}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">メモ</dt>
            <dd className="mt-1 text-gray-900 whitespace-pre-wrap">
              {shop.notes || "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Related Beans */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            この店舗で購入した豆
          </h2>
          <Button href={`/beans/new?shopId=${shop.id}`} size="sm">
            + 豆を追加
          </Button>
        </div>

        {shop.coffeeBeans.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {shop.coffeeBeans.map((bean) => (
              <li key={bean.id} className="py-3">
                <Link
                  href={`/beans/${bean.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {bean.name}
                    </span>
                    {bean.origin && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({bean.origin})
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      bean.status === "IN_STOCK"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {bean.status === "IN_STOCK" ? "在庫中" : "飲み切り"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">
            まだ豆が登録されていません
          </p>
        )}
      </div>

      {/* Back Link */}
      <div>
        <Link href="/shops" className="text-amber-600 hover:text-amber-800">
          ← 店舗一覧に戻る
        </Link>
      </div>
    </div>
  );
}

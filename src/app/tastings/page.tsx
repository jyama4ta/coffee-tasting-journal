import Link from "next/link";
import Button from "@/components/Button";
import BeanFilter from "@/components/BeanFilter";
import { prisma } from "@/lib/prisma";
import { formatDateTimeShort } from "@/lib/dateUtils";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

// 安全にflavorTagsをパースする関数
function parseFlavorTags(flavorTags: string | null): string[] {
  if (!flavorTags || flavorTags === "[]") return [];
  try {
    const parsed = JSON.parse(flavorTags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getTastings(beanId?: string, beanMasterId?: string) {
  // フィルタリング条件を構築
  let where = {};
  if (beanId) {
    where = { coffeeBeanId: parseInt(beanId, 10) };
  } else if (beanMasterId) {
    // 銘柄マスターでフィルタ: 該当する銘柄マスターに紐づく全ての豆の試飲記録を取得
    where = {
      coffeeBean: {
        beanMasterId: parseInt(beanMasterId, 10),
      },
    };
  }

  return prisma.tastingEntry.findMany({
    where,
    orderBy: { brewDate: "desc" },
    include: {
      coffeeBean: {
        include: {
          beanMaster: true,
        },
      },
      dripper: true,
      filter: true,
    },
  });
}

async function getBeans() {
  return prisma.coffeeBean.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      beanMasterId: true,
    },
  });
}

async function getBeanMasters() {
  return prisma.beanMaster.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

interface Props {
  searchParams: Promise<{ beanId?: string; beanMasterId?: string }>;
}

export default async function TastingsPage({ searchParams }: Props) {
  const { beanId, beanMasterId } = await searchParams;
  const [tastings, beans, beanMasters] = await Promise.all([
    getTastings(beanId, beanMasterId),
    getBeans(),
    getBeanMasters(),
  ]);

  const selectedBean = beanId
    ? beans.find((b) => b.id === parseInt(beanId, 10))
    : null;

  const selectedBeanMaster = beanMasterId
    ? beanMasters.find((m) => m.id === parseInt(beanMasterId, 10))
    : null;

  // フィルタ状態に応じた説明文
  const getFilterDescription = () => {
    if (selectedBean) {
      return `「${selectedBean.name}」の試飲記録`;
    }
    if (selectedBeanMaster) {
      return `銘柄「${selectedBeanMaster.name}」の試飲記録`;
    }
    return "すべての試飲記録";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 試飲記録</h1>
          <p className="text-gray-600">{getFilterDescription()}</p>
        </div>
        <Button href="/tastings/new">+ 新規記録</Button>
      </div>

      {/* Filter */}
      <BeanFilter
        beans={beans}
        beanMasters={beanMasters}
        selectedBeanId={beanId}
        selectedBeanMasterId={beanMasterId}
      />

      {/* List */}
      {tastings.length > 0 ? (
        <div className="space-y-4">
          {tastings.map((tasting) => (
            <div
              key={tasting.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <Link href={`/tastings/${tasting.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {formatDateTimeShort(tasting.brewDate)}
                      </span>
                      {tasting.overallRating && (
                        <span className="text-amber-500">
                          {"★".repeat(tasting.overallRating)}
                          {"☆".repeat(5 - tasting.overallRating)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-1">
                      {tasting.coffeeBean.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                      {tasting.grindSize && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          挽き目: {tasting.grindSize.toFixed(1)}
                        </span>
                      )}
                      {tasting.dripper && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {tasting.dripper.name}
                        </span>
                      )}
                      {tasting.filter && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {tasting.filter.name}
                        </span>
                      )}
                    </div>
                    {/* Flavor Tags */}
                    {parseFlavorTags(tasting.flavorTags).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {parseFlavorTags(tasting.flavorTags).map((tag) => (
                          <span
                            key={tag}
                            className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Ratings Preview */}
                  <div className="ml-4 text-right text-xs text-gray-500">
                    {tasting.acidity && <div>酸味: {tasting.acidity}/5</div>}
                    {tasting.bitterness && (
                      <div>苦味: {tasting.bitterness}/5</div>
                    )}
                    {tasting.sweetness && (
                      <div>甘味: {tasting.sweetness}/5</div>
                    )}
                  </div>
                </div>
                {tasting.notes && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {tasting.notes}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">
            {selectedBean
              ? `「${selectedBean.name}」の試飲記録がありません`
              : selectedBeanMaster
                ? `銘柄「${selectedBeanMaster.name}」の試飲記録がありません`
                : "まだ試飲記録がありません"}
          </p>
          <Button href="/tastings/new">試飲記録を追加</Button>
        </div>
      )}
    </div>
  );
}

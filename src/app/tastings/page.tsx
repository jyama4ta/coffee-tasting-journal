import Link from "next/link";
import Button from "@/components/Button";
import BeanFilter from "@/components/BeanFilter";
import { prisma } from "@/lib/prisma";
import { formatDateTimeShort } from "@/lib/dateUtils";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

// 平均評価を計算する関数
function calculateAverageRating(
  notes: {
    overallRating: number | null;
    acidity: number | null;
    bitterness: number | null;
    sweetness: number | null;
    aftertaste: number | null;
  }[],
): {
  overall: number | null;
  acidity: number | null;
  bitterness: number | null;
  sweetness: number | null;
  aftertaste: number | null;
} | null {
  if (notes.length === 0) return null;

  const avg = (values: (number | null)[]) => {
    const valid = values.filter((v): v is number => v !== null);
    return valid.length > 0
      ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
      : null;
  };

  return {
    overall: avg(notes.map((n) => n.overallRating)),
    acidity: avg(notes.map((n) => n.acidity)),
    bitterness: avg(notes.map((n) => n.bitterness)),
    sweetness: avg(notes.map((n) => n.sweetness)),
    aftertaste: avg(notes.map((n) => n.aftertaste)),
  };
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

  const tastings = await prisma.tastingEntry.findMany({
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
      tastingNotes: {
        select: {
          overallRating: true,
          acidity: true,
          bitterness: true,
          sweetness: true,
          aftertaste: true,
        },
      },
    },
  });

  // 平均評価を追加
  return tastings.map((tasting) => ({
    ...tasting,
    noteCount: tasting.tastingNotes.length,
    averageRating: calculateAverageRating(tasting.tastingNotes),
  }));
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
      return `「${selectedBean.name}」のドリップ記録`;
    }
    if (selectedBeanMaster) {
      return `銘柄「${selectedBeanMaster.name}」のドリップ記録`;
    }
    return "すべてのドリップ記録";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 ドリップ記録</h1>
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
              <div className="flex items-start justify-between">
                <Link href={`/tastings/${tasting.id}`} className="flex-1 block">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatDateTimeShort(tasting.brewDate)}
                    </span>
                    {tasting.averageRating?.overall && (
                      <span className="text-amber-500">
                        {"★".repeat(Math.round(tasting.averageRating.overall))}
                        {"☆".repeat(
                          5 - Math.round(tasting.averageRating.overall),
                        )}
                      </span>
                    )}
                    {tasting.noteCount > 0 && (
                      <span className="text-xs text-gray-500">
                        ({tasting.noteCount}件のノート)
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
                    {tasting.brewedBy && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        淹れた人: {tasting.brewedBy}
                      </span>
                    )}
                  </div>
                </Link>
                {/* ノート追加ボタン */}
                <div className="ml-4 flex flex-col items-end gap-2">
                  {tasting.averageRating && (
                    <div className="text-right text-xs text-gray-500">
                      {tasting.averageRating.acidity && (
                        <div>
                          酸味: {tasting.averageRating.acidity.toFixed(1)}
                        </div>
                      )}
                      {tasting.averageRating.bitterness && (
                        <div>
                          苦味: {tasting.averageRating.bitterness.toFixed(1)}
                        </div>
                      )}
                      {tasting.averageRating.sweetness && (
                        <div>
                          甘味: {tasting.averageRating.sweetness.toFixed(1)}
                        </div>
                      )}
                    </div>
                  )}
                  <Link
                    href={`/tastings/${tasting.id}/notes/new`}
                    className="text-xs px-3 py-1 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors whitespace-nowrap"
                  >
                    + ノート追加
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="mb-4">
            {selectedBean
              ? `「${selectedBean.name}」のドリップ記録がありません`
              : selectedBeanMaster
                ? `銘柄「${selectedBeanMaster.name}」のドリップ記録がありません`
                : "まだドリップ記録がありません"}
          </p>
          <Button href="/tastings/new">ドリップ記録を追加</Button>
        </div>
      )}
    </div>
  );
}

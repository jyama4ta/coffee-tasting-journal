import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import DeleteButton from "./DeleteButton";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/dateUtils";

// 常に最新のデータを取得する（キャッシュ無効化）
export const dynamic = "force-dynamic";

const BODY_LABELS: Record<string, string> = {
  LIGHT: "軽い",
  MEDIUM: "中程度",
  HEAVY: "重い",
};

const FLAVOR_TAG_LABELS: Record<string, string> = {
  BERRY: "ベリー",
  CITRUS: "シトラス",
  TROPICAL: "トロピカル",
  STONE_FRUIT: "ストーンフルーツ",
  CHOCOLATE: "チョコレート",
  NUTTY: "ナッツ",
  CARAMEL: "キャラメル",
  HONEY: "はちみつ",
  FLORAL: "フローラル",
  SPICE: "スパイス",
  HERBAL: "ハーブ",
  EARTHY: "アーシー",
};

async function getTasting(id: number) {
  return prisma.tastingEntry.findUnique({
    where: { id },
    include: {
      coffeeBean: {
        include: { shop: true },
      },
      dripper: true,
      filter: true,
      tastingNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TastingDetailPage({ params }: Props) {
  const { id } = await params;
  const tastingId = parseInt(id, 10);

  if (isNaN(tastingId)) {
    notFound();
  }

  const tasting = await getTasting(tastingId);

  if (!tasting) {
    notFound();
  }

  // flavorTagsはJSON文字列として保存されているのでパース
  const flavorTags: string[] = tasting.flavorTags
    ? (() => {
        try {
          const parsed = JSON.parse(tasting.flavorTags);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/tastings" className="hover:text-gray-900">
          ドリップ記録一覧
        </Link>
        <span>/</span>
        <span className="text-gray-900">
          {formatDateTime(tasting.brewDate)}の記録
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 ドリップ記録</h1>
          <p className="text-gray-600">{tasting.coffeeBean.name}の記録</p>
        </div>
        <div className="flex gap-2">
          <Button href={`/tastings/${tasting.id}/edit`} variant="outline">
            編集
          </Button>
          <DeleteButton tastingId={tasting.id} />
        </div>
      </div>

      {/* Bean Info */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <h2 className="text-sm font-medium text-amber-800 mb-2">使用した豆</h2>
        <Link
          href={`/beans/${tasting.coffeeBean.id}`}
          className="text-lg font-semibold text-amber-900 hover:underline"
        >
          {tasting.coffeeBean.name}
        </Link>
        {tasting.coffeeBean.origin && (
          <span className="ml-2 text-amber-700">
            ({tasting.coffeeBean.origin})
          </span>
        )}
      </div>

      {/* 画像表示 */}
      {tasting.imagePath && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">抽出写真</h2>
          <img
            src={`/api/images/${tasting.imagePath.replace("/images/", "")}`}
            alt="抽出風景"
            className="max-w-full max-h-96 rounded-lg border border-gray-200 object-contain"
          />
        </div>
      )}

      {/* Overall Rating */}
      {tasting.overallRating && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-sm font-medium text-gray-500 mb-2">総合評価</h2>
          <div className="text-4xl text-amber-500">
            {"★".repeat(tasting.overallRating)}
            {"☆".repeat(5 - tasting.overallRating)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extraction Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">抽出情報</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">抽出日時</dt>
              <dd className="text-gray-900">
                {formatDateTime(tasting.brewDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">ドリッパー</dt>
              <dd>
                {tasting.dripper ? (
                  <Link
                    href={`/drippers/${tasting.dripper.id}`}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    {tasting.dripper.name}
                  </Link>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">フィルター</dt>
              <dd>
                {tasting.filter ? (
                  <Link
                    href={`/filters/${tasting.filter.id}`}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    {tasting.filter.name}
                  </Link>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">挽き目</dt>
              <dd className="text-gray-900">
                {tasting.grindSize ? tasting.grindSize.toFixed(1) : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">淹れた人</dt>
              <dd className="text-gray-900">{tasting.brewedBy || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">入力した人</dt>
              <dd className="text-gray-900">{tasting.recordedBy || "-"}</dd>
            </div>
          </dl>
        </div>

        {/* Taste Profile */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">味の評価</h2>
          <div className="space-y-3">
            {[
              { label: "酸味", value: tasting.acidity },
              { label: "苦味", value: tasting.bitterness },
              { label: "甘味", value: tasting.sweetness },
              { label: "後味", value: tasting.aftertaste },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-amber-500">
                    {item.value
                      ? "★".repeat(item.value) + "☆".repeat(5 - item.value)
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-500">ボディ</span>
              <span className="text-gray-900">
                {tasting.body ? BODY_LABELS[tasting.body] || tasting.body : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flavor Tags */}
      {flavorTags.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            フレーバータグ
          </h2>
          <div className="flex flex-wrap gap-2">
            {flavorTags.map((tag) => (
              <span
                key={tag}
                className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm"
              >
                {FLAVOR_TAG_LABELS[tag] || tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {tasting.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            テイスティングノート
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{tasting.notes}</p>
        </div>
      )}

      {/* Tasting Notes from Other Tasters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            みんなのテイスティングノート
          </h2>
          <Button href={`/tastings/${tasting.id}/notes/new`} variant="primary">
            ノートを追加
          </Button>
        </div>
        {tasting.tastingNotes && tasting.tastingNotes.length > 0 ? (
          <div className="space-y-4">
            {tasting.tastingNotes.map((note) => {
              const noteFlavorTags: string[] = note.flavorTags
                ? (() => {
                    try {
                      const parsed = JSON.parse(note.flavorTags);
                      return Array.isArray(parsed) ? parsed : [];
                    } catch {
                      return [];
                    }
                  })()
                : [];
              return (
                <div
                  key={note.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">
                      {note.recordedBy || "匿名"}
                    </span>
                    {note.overallRating && (
                      <span className="text-amber-500">
                        {"★".repeat(note.overallRating)}
                        {"☆".repeat(5 - note.overallRating)}
                      </span>
                    )}
                  </div>
                  {/* Taste ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                    {[
                      { label: "酸味", value: note.acidity },
                      { label: "苦味", value: note.bitterness },
                      { label: "甘味", value: note.sweetness },
                      { label: "後味", value: note.aftertaste },
                    ].map(
                      (item) =>
                        item.value && (
                          <div key={item.label} className="text-gray-600">
                            {item.label}:{" "}
                            <span className="text-amber-500">
                              {"★".repeat(item.value)}
                            </span>
                          </div>
                        ),
                    )}
                    {note.body && (
                      <div className="text-gray-600">
                        ボディ: {BODY_LABELS[note.body] || note.body}
                      </div>
                    )}
                  </div>
                  {/* Flavor tags */}
                  {noteFlavorTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {noteFlavorTags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs"
                        >
                          {FLAVOR_TAG_LABELS[tag] || tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Notes text */}
                  {note.notes && (
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {note.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            まだテイスティングノートがありません。
            <br />
            最初のノートを追加してみましょう！
          </p>
        )}
      </div>

      {/* Back Link */}
      <div>
        <Link href="/tastings" className="text-amber-600 hover:text-amber-800">
          ← ドリップ記録一覧に戻る
        </Link>
      </div>
    </div>
  );
}

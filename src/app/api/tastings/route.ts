import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 平均評価を計算するヘルパー関数
function calculateAverageRating(
  notes: {
    acidity: number | null;
    bitterness: number | null;
    sweetness: number | null;
    body: string | null;
    aftertaste: number | null;
    overallRating: number | null;
  }[],
): {
  overall: number | null;
  acidity: number | null;
  bitterness: number | null;
  sweetness: number | null;
  aftertaste: number | null;
} | null {
  if (notes.length === 0) {
    return null;
  }

  const sum = {
    overall: 0,
    overallCount: 0,
    acidity: 0,
    acidityCount: 0,
    bitterness: 0,
    bitternessCount: 0,
    sweetness: 0,
    sweetnessCount: 0,
    aftertaste: 0,
    aftertasteCount: 0,
  };

  for (const note of notes) {
    if (note.overallRating !== null) {
      sum.overall += note.overallRating;
      sum.overallCount++;
    }
    if (note.acidity !== null) {
      sum.acidity += note.acidity;
      sum.acidityCount++;
    }
    if (note.bitterness !== null) {
      sum.bitterness += note.bitterness;
      sum.bitternessCount++;
    }
    if (note.sweetness !== null) {
      sum.sweetness += note.sweetness;
      sum.sweetnessCount++;
    }
    if (note.aftertaste !== null) {
      sum.aftertaste += note.aftertaste;
      sum.aftertasteCount++;
    }
  }

  return {
    overall: sum.overallCount > 0 ? sum.overall / sum.overallCount : null,
    acidity: sum.acidityCount > 0 ? sum.acidity / sum.acidityCount : null,
    bitterness:
      sum.bitternessCount > 0 ? sum.bitterness / sum.bitternessCount : null,
    sweetness:
      sum.sweetnessCount > 0 ? sum.sweetness / sum.sweetnessCount : null,
    aftertaste:
      sum.aftertasteCount > 0 ? sum.aftertaste / sum.aftertasteCount : null,
  };
}

/**
 * GET /api/tastings
 * ドリップ記録一覧を取得
 * クエリパラメータ:
 *   - coffeeBeanId: 豆IDでフィルタリング
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coffeeBeanIdParam = searchParams.get("coffeeBeanId");

  const where: { coffeeBeanId?: number } = {};
  if (coffeeBeanIdParam) {
    where.coffeeBeanId = parseInt(coffeeBeanIdParam, 10);
  }

  const tastings = await prisma.tastingEntry.findMany({
    where,
    include: {
      coffeeBean: true,
      dripper: true,
      filter: true,
      tastingNotes: true,
    },
    orderBy: { brewDate: "desc" },
  });

  // 平均評価とノート数を追加
  const tastingsWithAverageRating = tastings.map((tasting) => {
    const { tastingNotes, ...rest } = tasting;
    return {
      ...rest,
      noteCount: tastingNotes.length,
      averageRating: calculateAverageRating(tastingNotes),
    };
  });

  return NextResponse.json(tastingsWithAverageRating);
}

/**
 * POST /api/tastings
 * 新しいドリップ記録を作成（抽出情報のみ）
 */
export async function POST(request: Request) {
  const body = await request.json();
  const {
    coffeeBeanId,
    dripperId,
    filterId,
    grindSize,
    beanAmount,
    brewDate,
    imagePath,
    brewedBy,
    brewNotes,
  } = body;

  // 必須フィールドのバリデーション
  if (!coffeeBeanId) {
    return NextResponse.json({ error: "豆IDは必須です" }, { status: 400 });
  }

  if (!brewDate) {
    return NextResponse.json({ error: "抽出日は必須です" }, { status: 400 });
  }

  // 豆の存在確認とステータスチェック
  const coffeeBean = await prisma.coffeeBean.findUnique({
    where: { id: coffeeBeanId },
  });

  if (!coffeeBean) {
    return NextResponse.json(
      { error: "指定された豆が見つかりません" },
      { status: 400 },
    );
  }

  if (coffeeBean.status !== "IN_STOCK") {
    return NextResponse.json(
      { error: "在庫中の豆のみ選択可能です" },
      { status: 400 },
    );
  }

  const tasting = await prisma.tastingEntry.create({
    data: {
      coffeeBeanId,
      dripperId: dripperId || null,
      filterId: filterId || null,
      grindSize: grindSize || null,
      beanAmount: beanAmount || null,
      brewDate: new Date(brewDate),
      imagePath: imagePath || null,
      brewedBy: brewedBy || null,
      brewNotes: brewNotes || null,
    },
  });

  return NextResponse.json(tasting, { status: 201 });
}

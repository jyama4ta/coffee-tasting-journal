import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 有効なBody値
const VALID_BODY_VALUES = ["LIGHT", "MEDIUM", "HEAVY"];

// 評価値のバリデーション（1-5）
function validateRating(
  value: number | undefined | null,
  fieldName: string,
): string | null {
  if (value !== undefined && value !== null) {
    if (value < 1 || value > 5) {
      return `${fieldName}は1から5の範囲で指定してください`;
    }
  }
  return null;
}

// 総合評価のバリデーション（1-5）
function validateOverallRating(
  value: number | undefined | null,
): string | null {
  if (value !== undefined && value !== null) {
    if (value < 1 || value > 5) {
      return "総合評価は1から5の範囲で指定してください";
    }
  }
  return null;
}

/**
 * GET /api/tastings
 * 試飲記録一覧を取得
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
    },
    orderBy: { brewDate: "desc" },
  });

  return NextResponse.json(tastings);
}

/**
 * POST /api/tastings
 * 新しい試飲記録を作成
 */
export async function POST(request: Request) {
  const body = await request.json();
  const {
    coffeeBeanId,
    dripperId,
    filterId,
    grindSize,
    brewDate,
    acidity,
    bitterness,
    sweetness,
    body: bodyValue,
    aftertaste,
    flavorTags,
    overallRating,
    notes,
    imagePath,
    brewedBy,
    recordedBy,
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

  // ボディのバリデーション
  if (bodyValue && !VALID_BODY_VALUES.includes(bodyValue)) {
    return NextResponse.json(
      {
        error: `無効なボディ値です。有効な値: ${VALID_BODY_VALUES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  // 評価値のバリデーション
  const acidityError = validateRating(acidity, "酸味");
  if (acidityError) {
    return NextResponse.json({ error: acidityError }, { status: 400 });
  }

  const bitternessError = validateRating(bitterness, "苦味");
  if (bitternessError) {
    return NextResponse.json({ error: bitternessError }, { status: 400 });
  }

  const sweetnessError = validateRating(sweetness, "甘味");
  if (sweetnessError) {
    return NextResponse.json({ error: sweetnessError }, { status: 400 });
  }

  const aftertasteError = validateRating(aftertaste, "後味");
  if (aftertasteError) {
    return NextResponse.json({ error: aftertasteError }, { status: 400 });
  }

  // 総合評価のバリデーション
  const overallRatingError = validateOverallRating(overallRating);
  if (overallRatingError) {
    return NextResponse.json({ error: overallRatingError }, { status: 400 });
  }

  // フレーバータグをJSON文字列に変換
  const flavorTagsJson = flavorTags ? JSON.stringify(flavorTags) : null;

  const tasting = await prisma.tastingEntry.create({
    data: {
      coffeeBeanId,
      dripperId: dripperId || null,
      filterId: filterId || null,
      grindSize: grindSize || null,
      brewDate: new Date(brewDate),
      acidity: acidity || null,
      bitterness: bitterness || null,
      sweetness: sweetness || null,
      body: bodyValue || null,
      aftertaste: aftertaste || null,
      flavorTags: flavorTagsJson,
      overallRating: overallRating || null,
      notes: notes || null,
      imagePath: imagePath || null,
      brewedBy: brewedBy || null,
      recordedBy: recordedBy || null,
    },
  });

  return NextResponse.json(tasting, { status: 201 });
}

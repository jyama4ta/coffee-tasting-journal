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

// IDパラメータのパースとバリデーション
function parseId(id: string): {
  valid: boolean;
  value?: number;
  error?: string;
} {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed)) {
    return { valid: false, error: "無効なIDです" };
  }
  return { valid: true, value: parsed };
}

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/tastings/[id]
 * 指定したIDの試飲記録を取得
 */
export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const parsedId = parseId(id);

  if (!parsedId.valid) {
    return NextResponse.json({ error: parsedId.error }, { status: 400 });
  }

  const tasting = await prisma.tastingEntry.findUnique({
    where: { id: parsedId.value },
    include: {
      coffeeBean: true,
      dripper: true,
      filter: true,
    },
  });

  if (!tasting) {
    return NextResponse.json(
      { error: "試飲記録が見つかりません" },
      { status: 404 },
    );
  }

  return NextResponse.json(tasting);
}

/**
 * PUT /api/tastings/[id]
 * 試飲記録を更新
 */
export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  const parsedId = parseId(id);

  if (!parsedId.valid) {
    return NextResponse.json({ error: parsedId.error }, { status: 400 });
  }

  // 存在確認
  const existingTasting = await prisma.tastingEntry.findUnique({
    where: { id: parsedId.value },
  });

  if (!existingTasting) {
    return NextResponse.json(
      { error: "試飲記録が見つかりません" },
      { status: 404 },
    );
  }

  const body = await request.json();
  const {
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

  // 更新データの構築
  const updateData: Record<string, unknown> = {};

  if (dripperId !== undefined) updateData.dripperId = dripperId || null;
  if (filterId !== undefined) updateData.filterId = filterId || null;
  if (grindSize !== undefined) updateData.grindSize = grindSize;
  if (brewDate !== undefined) updateData.brewDate = new Date(brewDate);
  if (acidity !== undefined) updateData.acidity = acidity;
  if (bitterness !== undefined) updateData.bitterness = bitterness;
  if (sweetness !== undefined) updateData.sweetness = sweetness;
  if (bodyValue !== undefined) updateData.body = bodyValue;
  if (aftertaste !== undefined) updateData.aftertaste = aftertaste;
  if (flavorTags !== undefined) {
    updateData.flavorTags = flavorTags ? JSON.stringify(flavorTags) : null;
  }
  if (overallRating !== undefined) updateData.overallRating = overallRating;
  if (notes !== undefined) updateData.notes = notes;
  if (imagePath !== undefined) updateData.imagePath = imagePath;
  if (brewedBy !== undefined) updateData.brewedBy = brewedBy || null;
  if (recordedBy !== undefined) updateData.recordedBy = recordedBy || null;

  const updatedTasting = await prisma.tastingEntry.update({
    where: { id: parsedId.value },
    data: updateData,
    include: {
      coffeeBean: true,
      dripper: true,
      filter: true,
    },
  });

  return NextResponse.json(updatedTasting);
}

/**
 * DELETE /api/tastings/[id]
 * 試飲記録を削除
 */
export async function DELETE(request: Request, context: Context) {
  const { id } = await context.params;
  const parsedId = parseId(id);

  if (!parsedId.valid) {
    return NextResponse.json({ error: parsedId.error }, { status: 400 });
  }

  // 存在確認
  const existingTasting = await prisma.tastingEntry.findUnique({
    where: { id: parsedId.value },
  });

  if (!existingTasting) {
    return NextResponse.json(
      { error: "試飲記録が見つかりません" },
      { status: 404 },
    );
  }

  await prisma.tastingEntry.delete({
    where: { id: parsedId.value },
  });

  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
 * 指定したIDのドリップ記録を取得
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
      tastingNotes: true,
    },
  });

  if (!tasting) {
    return NextResponse.json(
      { error: "ドリップ記録が見つかりません" },
      { status: 404 },
    );
  }

  return NextResponse.json(tasting);
}

/**
 * PUT /api/tastings/[id]
 * ドリップ記録を更新（抽出情報のみ）
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
      { error: "ドリップ記録が見つかりません" },
      { status: 404 },
    );
  }

  const body = await request.json();
  const {
    dripperId,
    filterId,
    grindSize,
    beanAmount,
    brewDate,
    imagePath,
    brewedBy,
    brewNotes,
  } = body;

  // 更新データの構築
  const updateData: Record<string, unknown> = {};

  if (dripperId !== undefined) updateData.dripperId = dripperId || null;
  if (filterId !== undefined) updateData.filterId = filterId || null;
  if (grindSize !== undefined) updateData.grindSize = grindSize;
  if (beanAmount !== undefined) updateData.beanAmount = beanAmount || null;
  if (brewDate !== undefined) updateData.brewDate = new Date(brewDate);
  if (imagePath !== undefined) updateData.imagePath = imagePath;
  if (brewedBy !== undefined) updateData.brewedBy = brewedBy || null;
  if (brewNotes !== undefined) updateData.brewNotes = brewNotes || null;

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
 * ドリップ記録を削除
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
      { error: "ドリップ記録が見つかりません" },
      { status: 404 },
    );
  }

  await prisma.tastingEntry.delete({
    where: { id: parsedId.value },
  });

  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

// 有効なフィルター種類
const VALID_FILTER_TYPES = ["PAPER", "METAL", "CLOTH"] as const;

// 有効なサイズ値
const VALID_SIZES = [
  "SIZE_01",
  "SIZE_02",
  "SIZE_03",
  "SIZE_04",
  "OTHER",
] as const;

// IDをパースするヘルパー関数
function parseId(id: string): number | null {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

// GET /api/filters/[id] - 指定したフィルターを取得
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const filterId = parseId(id);

    if (filterId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const filter = await prisma.filter.findUnique({
      where: { id: filterId },
    });

    if (!filter) {
      return NextResponse.json(
        { error: "フィルターが見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(filter);
  } catch (error) {
    console.error("Failed to fetch filter:", error);
    return NextResponse.json(
      { error: "フィルターの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PUT /api/filters/[id] - フィルターを更新
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const filterId = parseId(id);

    if (filterId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション: 名前が指定されている場合は空でないこと
    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")
    ) {
      return NextResponse.json(
        { error: "フィルター名は空にできません" },
        { status: 400 },
      );
    }

    // バリデーション: フィルター種類が指定されている場合は有効な値であること
    if (
      body.type !== undefined &&
      body.type !== null &&
      !VALID_FILTER_TYPES.includes(body.type)
    ) {
      return NextResponse.json(
        {
          error: `フィルター種類は ${VALID_FILTER_TYPES.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 },
      );
    }

    // バリデーション: サイズが指定されている場合は有効な値であること
    if (
      body.size !== undefined &&
      body.size !== null &&
      !VALID_SIZES.includes(body.size)
    ) {
      return NextResponse.json(
        {
          error: `サイズは ${VALID_SIZES.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 },
      );
    }

    // フィルターの存在確認
    const existing = await prisma.filter.findUnique({
      where: { id: filterId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "フィルターが見つかりません" },
        { status: 404 },
      );
    }

    const filter = await prisma.filter.update({
      where: { id: filterId },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        type: body.type !== undefined ? body.type : undefined,
        size: body.size !== undefined ? body.size : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        url: body.url !== undefined ? body.url : undefined,
        imagePath: body.imagePath !== undefined ? body.imagePath : undefined,
      },
    });

    return NextResponse.json(filter);
  } catch (error) {
    console.error("Failed to update filter:", error);
    return NextResponse.json(
      { error: "フィルターの更新に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/filters/[id] - フィルターを削除
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const filterId = parseId(id);

    if (filterId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // フィルターの存在確認
    const existing = await prisma.filter.findUnique({
      where: { id: filterId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "フィルターが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.filter.delete({
      where: { id: filterId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete filter:", error);
    return NextResponse.json(
      { error: "フィルターの削除に失敗しました" },
      { status: 500 },
    );
  }
}

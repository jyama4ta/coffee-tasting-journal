import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

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

// GET /api/drippers/[id] - 指定したドリッパーを取得
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const dripperId = parseId(id);

    if (dripperId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const dripper = await prisma.dripper.findUnique({
      where: { id: dripperId },
    });

    if (!dripper) {
      return NextResponse.json(
        { error: "ドリッパーが見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(dripper);
  } catch (error) {
    console.error("Failed to fetch dripper:", error);
    return NextResponse.json(
      { error: "ドリッパーの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PUT /api/drippers/[id] - ドリッパーを更新
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const dripperId = parseId(id);

    if (dripperId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション: 名前が指定されている場合は空でないこと
    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")
    ) {
      return NextResponse.json(
        { error: "ドリッパー名は空にできません" },
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

    // ドリッパーの存在確認
    const existing = await prisma.dripper.findUnique({
      where: { id: dripperId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ドリッパーが見つかりません" },
        { status: 404 },
      );
    }

    const dripper = await prisma.dripper.update({
      where: { id: dripperId },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        manufacturer:
          body.manufacturer !== undefined ? body.manufacturer : undefined,
        size: body.size !== undefined ? body.size : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        url: body.url !== undefined ? body.url : undefined,
        imagePath: body.imagePath !== undefined ? body.imagePath : undefined,
      },
    });

    return NextResponse.json(dripper);
  } catch (error) {
    console.error("Failed to update dripper:", error);
    return NextResponse.json(
      { error: "ドリッパーの更新に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/drippers/[id] - ドリッパーを削除
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const dripperId = parseId(id);

    if (dripperId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // ドリッパーの存在確認
    const existing = await prisma.dripper.findUnique({
      where: { id: dripperId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "ドリッパーが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.dripper.delete({
      where: { id: dripperId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete dripper:", error);
    return NextResponse.json(
      { error: "ドリッパーの削除に失敗しました" },
      { status: 500 },
    );
  }
}

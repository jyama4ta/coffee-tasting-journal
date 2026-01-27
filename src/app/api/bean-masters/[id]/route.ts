import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/bean-masters/[id]
 * 指定したIDの銘柄マスターを取得
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const beanMaster = await prisma.beanMaster.findUnique({
      where: { id: parsedId },
      include: {
        origin: true,
        _count: {
          select: { coffeeBeans: true },
        },
      },
    });

    if (!beanMaster) {
      return NextResponse.json(
        { error: "銘柄が見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(beanMaster);
  } catch (error) {
    console.error("Failed to fetch bean master:", error);
    return NextResponse.json(
      { error: "銘柄マスターの取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bean-masters/[id]
 * 指定したIDの銘柄マスターを更新
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション: 銘柄名は必須
    if (body.name !== undefined && body.name.trim() === "") {
      return NextResponse.json({ error: "銘柄名は必須です" }, { status: 400 });
    }

    // 銘柄の存在確認
    const existing = await prisma.beanMaster.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "銘柄が見つかりません" },
        { status: 404 },
      );
    }

    const beanMaster = await prisma.beanMaster.update({
      where: { id: parsedId },
      data: {
        name: body.name?.trim() ?? existing.name,
        originId:
          body.originId !== undefined ? body.originId : existing.originId,
        notes:
          body.notes !== undefined
            ? body.notes?.trim() || null
            : existing.notes,
      },
      include: {
        origin: true,
      },
    });

    return NextResponse.json(beanMaster);
  } catch (error) {
    console.error("Failed to update bean master:", error);
    return NextResponse.json(
      { error: "銘柄マスターの更新に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bean-masters/[id]
 * 指定したIDの銘柄マスターを削除
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // 銘柄の存在確認
    const existing = await prisma.beanMaster.findUnique({
      where: { id: parsedId },
      include: {
        _count: {
          select: { coffeeBeans: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "銘柄が見つかりません" },
        { status: 404 },
      );
    }

    // 購入記録がある場合は削除不可
    if (existing._count.coffeeBeans > 0) {
      return NextResponse.json(
        { error: "この銘柄には購入記録があるため削除できません" },
        { status: 400 },
      );
    }

    await prisma.beanMaster.delete({
      where: { id: parsedId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bean master:", error);
    return NextResponse.json(
      { error: "銘柄マスターの削除に失敗しました" },
      { status: 500 },
    );
  }
}

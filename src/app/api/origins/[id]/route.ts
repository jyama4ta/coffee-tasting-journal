import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/origins/[id] - 産地詳細取得
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const originId = parseInt(id, 10);

    if (isNaN(originId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const origin = await prisma.originMaster.findUnique({
      where: { id: originId },
    });

    if (!origin) {
      return NextResponse.json(
        { error: "産地が見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(origin);
  } catch (error) {
    console.error("Failed to fetch origin:", error);
    return NextResponse.json(
      { error: "産地の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PUT /api/origins/[id] - 産地更新
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const originId = parseInt(id, 10);

    if (isNaN(originId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const existing = await prisma.originMaster.findUnique({
      where: { id: originId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "産地が見つかりません" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, notes } = body;

    // バリデーション
    if (name !== undefined && name.trim() === "") {
      return NextResponse.json(
        { error: "産地名を空にすることはできません" },
        { status: 400 },
      );
    }

    const origin = await prisma.originMaster.update({
      where: { id: originId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(origin);
  } catch (error) {
    console.error("Failed to update origin:", error);
    return NextResponse.json(
      { error: "産地の更新に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/origins/[id] - 産地削除
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const originId = parseInt(id, 10);

    if (isNaN(originId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const existing = await prisma.originMaster.findUnique({
      where: { id: originId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "産地が見つかりません" },
        { status: 404 },
      );
    }

    await prisma.originMaster.delete({
      where: { id: originId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete origin:", error);
    return NextResponse.json(
      { error: "産地の削除に失敗しました" },
      { status: 500 },
    );
  }
}

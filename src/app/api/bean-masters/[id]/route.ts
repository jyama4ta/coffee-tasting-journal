import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROAST_LEVELS, PROCESSES } from "@/lib/constants";

// 有効な焙煎度の値
const validRoastLevels = ROAST_LEVELS.map((r) => r.value);
// 有効な精製方法の値
const validProcesses = PROCESSES.map((p) => p.value);

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
      return NextResponse.json(
        { error: "無効なIDです" },
        { status: 400 },
      );
    }

    const beanMaster = await prisma.beanMaster.findUnique({
      where: { id: parsedId },
      include: {
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
      return NextResponse.json(
        { error: "無効なIDです" },
        { status: 400 },
      );
    }

    const body = await request.json();

    // バリデーション: 銘柄名は必須
    if (body.name !== undefined && body.name.trim() === "") {
      return NextResponse.json(
        { error: "銘柄名は必須です" },
        { status: 400 },
      );
    }

    // バリデーション: 焙煎度が指定されている場合は有効な値かチェック
    if (body.roastLevel && !validRoastLevels.includes(body.roastLevel)) {
      return NextResponse.json(
        { error: "無効な焙煎度です" },
        { status: 400 },
      );
    }

    // バリデーション: 精製方法が指定されている場合は有効な値かチェック
    if (body.process && !validProcesses.includes(body.process)) {
      return NextResponse.json(
        { error: "無効な精製方法です" },
        { status: 400 },
      );
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
        origin: body.origin !== undefined ? body.origin?.trim() || null : existing.origin,
        roastLevel: body.roastLevel !== undefined ? body.roastLevel || null : existing.roastLevel,
        process: body.process !== undefined ? body.process || null : existing.process,
        notes: body.notes !== undefined ? body.notes?.trim() || null : existing.notes,
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
      return NextResponse.json(
        { error: "無効なIDです" },
        { status: 400 },
      );
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

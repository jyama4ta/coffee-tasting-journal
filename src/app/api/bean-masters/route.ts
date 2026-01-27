import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bean-masters
 * 銘柄マスター一覧を取得
 */
export async function GET() {
  try {
    const beanMasters = await prisma.beanMaster.findMany({
      orderBy: { name: "asc" },
      include: {
        origin: true,
      },
    });

    return NextResponse.json(beanMasters);
  } catch (error) {
    console.error("Failed to fetch bean masters:", error);
    return NextResponse.json(
      { error: "銘柄マスターの取得に失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bean-masters
 * 銘柄マスターを新規作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション: 銘柄名は必須
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "銘柄名は必須です" }, { status: 400 });
    }

    // バリデーション: 産地IDが指定されている場合は存在確認
    if (body.originId) {
      const originExists = await prisma.originMaster.findUnique({
        where: { id: body.originId },
      });
      if (!originExists) {
        return NextResponse.json(
          { error: "指定された産地が存在しません" },
          { status: 400 },
        );
      }
    }

    const beanMaster = await prisma.beanMaster.create({
      data: {
        name: body.name.trim(),
        originId: body.originId || null,
        notes: body.notes?.trim() || null,
      },
      include: {
        origin: true,
      },
    });

    return NextResponse.json(beanMaster, { status: 201 });
  } catch (error) {
    console.error("Failed to create bean master:", error);
    return NextResponse.json(
      { error: "銘柄マスターの作成に失敗しました" },
      { status: 500 },
    );
  }
}

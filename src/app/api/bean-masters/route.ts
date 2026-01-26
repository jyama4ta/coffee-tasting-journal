import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROAST_LEVELS, PROCESSES } from "@/lib/constants";

// 有効な焙煎度の値
const validRoastLevels = ROAST_LEVELS.map((r) => r.value);
// 有効な精製方法の値
const validProcesses = PROCESSES.map((p) => p.value);

/**
 * GET /api/bean-masters
 * 銘柄マスター一覧を取得
 */
export async function GET() {
  try {
    const beanMasters = await prisma.beanMaster.findMany({
      orderBy: { name: "asc" },
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

    const beanMaster = await prisma.beanMaster.create({
      data: {
        name: body.name.trim(),
        origin: body.origin?.trim() || null,
        roastLevel: body.roastLevel || null,
        process: body.process || null,
        notes: body.notes?.trim() || null,
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

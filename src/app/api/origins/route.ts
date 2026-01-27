import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/origins - 産地一覧取得
export async function GET() {
  try {
    const origins = await prisma.originMaster.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(origins);
  } catch (error) {
    console.error("Failed to fetch origins:", error);
    return NextResponse.json(
      { error: "産地の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/origins - 産地作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, notes } = body;

    // バリデーション
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "産地名は必須です" }, { status: 400 });
    }

    // 重複チェック
    const existing = await prisma.originMaster.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "同じ名前の産地が既に存在します" },
        { status: 400 },
      );
    }

    const origin = await prisma.originMaster.create({
      data: {
        name: name.trim(),
        notes: notes || null,
      },
    });

    return NextResponse.json(origin, { status: 201 });
  } catch (error) {
    console.error("Failed to create origin:", error);
    return NextResponse.json(
      { error: "産地の作成に失敗しました" },
      { status: 500 },
    );
  }
}

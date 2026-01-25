import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/drippers - 全ドリッパーを取得
export async function GET() {
  try {
    const drippers = await prisma.dripper.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(drippers);
  } catch (error) {
    console.error("Failed to fetch drippers:", error);
    return NextResponse.json(
      { error: "ドリッパーの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/drippers - 新規ドリッパーを作成
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション: ドリッパー名は必須
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "ドリッパー名は必須です" },
        { status: 400 },
      );
    }

    const dripper = await prisma.dripper.create({
      data: {
        name: body.name.trim(),
        manufacturer: body.manufacturer || null,
        notes: body.notes || null,
        imagePath: body.imagePath || null,
      },
    });

    return NextResponse.json(dripper, { status: 201 });
  } catch (error) {
    console.error("Failed to create dripper:", error);
    return NextResponse.json(
      { error: "ドリッパーの作成に失敗しました" },
      { status: 500 },
    );
  }
}

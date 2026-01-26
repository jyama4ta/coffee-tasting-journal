import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 有効なフィルター種類
const VALID_FILTER_TYPES = ["PAPER", "METAL", "CLOTH"] as const;

// GET /api/filters - 全フィルターを取得
export async function GET() {
  try {
    const filters = await prisma.filter.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(filters);
  } catch (error) {
    console.error("Failed to fetch filters:", error);
    return NextResponse.json(
      { error: "フィルターの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/filters - 新規フィルターを作成
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション: フィルター名は必須
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "フィルター名は必須です" },
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

    const filter = await prisma.filter.create({
      data: {
        name: body.name.trim(),
        type: body.type || null,
        notes: body.notes || null,
        url: body.url || null,
        imagePath: body.imagePath || null,
      },
    });

    return NextResponse.json(filter, { status: 201 });
  } catch (error) {
    console.error("Failed to create filter:", error);
    return NextResponse.json(
      { error: "フィルターの作成に失敗しました" },
      { status: 500 },
    );
  }
}

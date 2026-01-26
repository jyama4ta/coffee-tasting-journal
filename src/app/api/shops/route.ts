import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// displayNameを生成するヘルパー関数
function getDisplayName(name: string, branchName: string | null): string {
  if (branchName) {
    return `${name} ${branchName}`;
  }
  return name;
}

// GET /api/shops - 全店舗を取得
export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: "asc" },
    });

    // displayNameを追加
    const shopsWithDisplayName = shops.map((shop) => ({
      ...shop,
      displayName: getDisplayName(shop.name, shop.branchName),
    }));

    return NextResponse.json(shopsWithDisplayName);
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return NextResponse.json(
      { error: "店舗の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/shops - 新規店舗を作成
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim() || "";
    const branchName = body.branchName?.trim() || null;

    // バリデーション: 店舗名は必須
    if (!name) {
      return NextResponse.json({ error: "店舗名は必須です" }, { status: 400 });
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        branchName,
        address: body.address || null,
        url: body.url || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error("Failed to create shop:", error);
    return NextResponse.json(
      { error: "店舗の作成に失敗しました" },
      { status: 500 },
    );
  }
}

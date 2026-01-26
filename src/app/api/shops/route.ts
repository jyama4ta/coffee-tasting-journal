import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// displayNameを生成するヘルパー関数
function getDisplayName(brandName: string | null, name: string): string {
  if (brandName && name) {
    return `${brandName} ${name}`;
  }
  return brandName || name;
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
      displayName: getDisplayName(shop.brandName, shop.name),
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

    const brandName = body.brandName?.trim() || null;
    const name = body.name?.trim() || "";

    // バリデーション: ブランド名と店舗名の両方が空の場合はエラー
    if (!brandName && !name) {
      return NextResponse.json(
        { error: "ブランド名または店舗名は必須です" },
        { status: 400 },
      );
    }

    const shop = await prisma.shop.create({
      data: {
        brandName,
        name,
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

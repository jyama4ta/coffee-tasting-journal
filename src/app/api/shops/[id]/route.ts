import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

// IDをパースするヘルパー関数
function parseId(id: string): number | null {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

// displayNameを生成するヘルパー関数
function getDisplayName(brandName: string | null, name: string): string {
  if (brandName && name) {
    return `${brandName} ${name}`;
  }
  return brandName || name;
}

// GET /api/shops/[id] - 指定した店舗を取得
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const shopId = parseId(id);

    if (shopId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "店舗が見つかりません" },
        { status: 404 },
      );
    }

    // displayNameを追加
    const shopWithDisplayName = {
      ...shop,
      displayName: getDisplayName(shop.brandName, shop.name),
    };

    return NextResponse.json(shopWithDisplayName);
  } catch (error) {
    console.error("Failed to fetch shop:", error);
    return NextResponse.json(
      { error: "店舗の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PUT /api/shops/[id] - 店舗を更新
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const shopId = parseId(id);

    if (shopId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const body = await request.json();

    // 店舗の存在確認
    const existing = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "店舗が見つかりません" },
        { status: 404 },
      );
    }

    // 更新後の値を計算
    const newBrandName =
      body.brandName !== undefined
        ? body.brandName?.trim() || null
        : existing.brandName;
    const newName =
      body.name !== undefined ? body.name?.trim() || "" : existing.name;

    // バリデーション: 両方が空になる場合はエラー
    if (!newBrandName && !newName) {
      return NextResponse.json(
        { error: "ブランド名または店舗名は必須です" },
        { status: 400 },
      );
    }

    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        brandName:
          body.brandName !== undefined
            ? body.brandName?.trim() || null
            : undefined,
        name: body.name !== undefined ? body.name?.trim() || "" : undefined,
        address: body.address !== undefined ? body.address : undefined,
        url: body.url !== undefined ? body.url : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });

    // displayNameを追加
    const shopWithDisplayName = {
      ...shop,
      displayName: getDisplayName(shop.brandName, shop.name),
    };

    return NextResponse.json(shopWithDisplayName);
  } catch (error) {
    console.error("Failed to update shop:", error);
    return NextResponse.json(
      { error: "店舗の更新に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/shops/[id] - 店舗を削除
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const shopId = parseId(id);

    if (shopId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // 店舗の存在確認
    const existing = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "店舗が見つかりません" },
        { status: 404 },
      );
    }

    await prisma.shop.delete({
      where: { id: shopId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete shop:", error);
    return NextResponse.json(
      { error: "店舗の削除に失敗しました" },
      { status: 500 },
    );
  }
}

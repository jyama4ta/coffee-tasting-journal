import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 有効な焙煎度
const VALID_ROAST_LEVELS = [
  "LIGHT",
  "CINNAMON",
  "MEDIUM",
  "HIGH",
  "CITY",
  "FULL_CITY",
  "FRENCH",
  "ITALIAN",
] as const;

// 有効な精製方法
const VALID_PROCESSES = [
  "WASHED",
  "NATURAL",
  "HONEY",
  "PULPED_NATURAL",
  "SEMI_WASHED",
] as const;

// 有効な豆タイプ
const VALID_BEAN_TYPES = ["SINGLE_ORIGIN", "BLEND"] as const;

// 有効なステータス
const VALID_STATUSES = ["IN_STOCK", "FINISHED"] as const;

// GET /api/beans - 全豆を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // フィルタリング条件を構築
    const where: { status?: (typeof VALID_STATUSES)[number] } = {};
    if (
      status &&
      VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
    ) {
      where.status = status as (typeof VALID_STATUSES)[number];
    }

    const beans = await prisma.coffeeBean.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        shop: true,
      },
    });
    return NextResponse.json(beans);
  } catch (error) {
    console.error("Failed to fetch beans:", error);
    return NextResponse.json(
      { error: "コーヒー豆の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/beans - 新規豆を作成
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション: 豆名は必須
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "豆の銘柄名は必須です" },
        { status: 400 },
      );
    }

    // バリデーション: 焙煎度が指定されている場合は有効な値であること
    if (
      body.roastLevel !== undefined &&
      body.roastLevel !== null &&
      !VALID_ROAST_LEVELS.includes(body.roastLevel)
    ) {
      return NextResponse.json(
        {
          error: `焙煎度は ${VALID_ROAST_LEVELS.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 },
      );
    }

    // バリデーション: 精製方法が指定されている場合は有効な値であること
    if (
      body.process !== undefined &&
      body.process !== null &&
      !VALID_PROCESSES.includes(body.process)
    ) {
      return NextResponse.json(
        {
          error: `精製方法は ${VALID_PROCESSES.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 },
      );
    }

    // バリデーション: 豆タイプが指定されている場合は有効な値であること
    if (
      body.beanType !== undefined &&
      body.beanType !== null &&
      !VALID_BEAN_TYPES.includes(body.beanType)
    ) {
      return NextResponse.json(
        {
          error: `豆タイプは ${VALID_BEAN_TYPES.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 },
      );
    }

    // バリデーション: 店舗IDが指定されている場合は存在確認
    if (body.shopId !== undefined && body.shopId !== null) {
      const shop = await prisma.shop.findUnique({
        where: { id: body.shopId },
      });
      if (!shop) {
        return NextResponse.json(
          { error: "指定された店舗が見つかりません" },
          { status: 400 },
        );
      }
    }

    // バリデーション: 新規登録時は飲み切りステータスでの登録不可
    // （豆は購入時に在庫中で登録し、後から飲み切りに変更するフローのみ）
    if (body.status === "FINISHED") {
      return NextResponse.json(
        {
          error:
            "新規登録時は在庫中ステータスのみ指定可能です。飲み切りへの変更はPATCHで行ってください",
        },
        { status: 400 },
      );
    }

    const bean = await prisma.coffeeBean.create({
      data: {
        name: body.name.trim(),
        origin: body.origin || null,
        roastLevel: body.roastLevel || null,
        process: body.process || null,
        isDecaf: body.isDecaf ?? false,
        beanType: body.beanType || null,
        notes: body.notes || null,
        url: body.url || null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        price: body.price || null,
        amount: body.amount || null,
        shopId: body.shopId || null,
        imagePath: body.imagePath || null,
      },
    });

    return NextResponse.json(bean, { status: 201 });
  } catch (error) {
    console.error("Failed to create bean:", error);
    return NextResponse.json(
      { error: "コーヒー豆の作成に失敗しました" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

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

// IDをパースするヘルパー関数
function parseId(id: string): number | null {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
}

// GET /api/beans/[id] - 指定した豆を取得
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const beanId = parseId(id);

    if (beanId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const bean = await prisma.coffeeBean.findUnique({
      where: { id: beanId },
      include: {
        shop: true,
        tastingEntries: {
          orderBy: { brewDate: "desc" },
        },
      },
    });

    if (!bean) {
      return NextResponse.json(
        { error: "コーヒー豆が見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(bean);
  } catch (error) {
    console.error("Failed to fetch bean:", error);
    return NextResponse.json(
      { error: "コーヒー豆の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PUT /api/beans/[id] - 豆を更新
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const beanId = parseId(id);

    if (beanId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション: 名前が指定されている場合は空でないこと
    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")
    ) {
      return NextResponse.json(
        { error: "豆の銘柄名は空にできません" },
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

    // 豆の存在確認
    const existing = await prisma.coffeeBean.findUnique({
      where: { id: beanId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "コーヒー豆が見つかりません" },
        { status: 404 },
      );
    }

    const bean = await prisma.coffeeBean.update({
      where: { id: beanId },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        origin: body.origin !== undefined ? body.origin : undefined,
        roastLevel: body.roastLevel !== undefined ? body.roastLevel : undefined,
        process: body.process !== undefined ? body.process : undefined,
        isDecaf: body.isDecaf !== undefined ? body.isDecaf : undefined,
        beanType: body.beanType !== undefined ? body.beanType : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        purchaseDate:
          body.purchaseDate !== undefined
            ? body.purchaseDate
              ? new Date(body.purchaseDate)
              : null
            : undefined,
        price: body.price !== undefined ? body.price : undefined,
        amount: body.amount !== undefined ? body.amount : undefined,
        shopId: body.shopId !== undefined ? body.shopId : undefined,
        imagePath: body.imagePath !== undefined ? body.imagePath : undefined,
      },
    });

    return NextResponse.json(bean);
  } catch (error) {
    console.error("Failed to update bean:", error);
    return NextResponse.json(
      { error: "コーヒー豆の更新に失敗しました" },
      { status: 500 },
    );
  }
}

// PATCH /api/beans/[id] - ステータスを変更
export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const beanId = parseId(id);

    if (beanId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション: ステータスは必須かつ有効な値であること
    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          error: `ステータスは ${VALID_STATUSES.join(", ")} のいずれかを指定してください`,
        },
        { status: 400 },
      );
    }

    // 豆の存在確認
    const existing = await prisma.coffeeBean.findUnique({
      where: { id: beanId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "コーヒー豆が見つかりません" },
        { status: 404 },
      );
    }

    // ステータス変更に応じた処理
    const updateData: {
      status: (typeof VALID_STATUSES)[number];
      finishedDate: Date | null;
    } = {
      status: body.status,
      finishedDate:
        body.status === "FINISHED"
          ? new Date() // 飲み切りの場合は現在日時を設定
          : null, // 在庫中に戻す場合はクリア
    };

    const bean = await prisma.coffeeBean.update({
      where: { id: beanId },
      data: updateData,
    });

    return NextResponse.json(bean);
  } catch (error) {
    console.error("Failed to update bean status:", error);
    return NextResponse.json(
      { error: "ステータスの変更に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/beans/[id] - 豆を削除
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const beanId = parseId(id);

    if (beanId === null) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // 豆の存在確認
    const existing = await prisma.coffeeBean.findUnique({
      where: { id: beanId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "コーヒー豆が見つかりません" },
        { status: 404 },
      );
    }

    // 関連する試飲記録も一緒に削除される（Cascade）
    await prisma.coffeeBean.delete({
      where: { id: beanId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete bean:", error);
    return NextResponse.json(
      { error: "コーヒー豆の削除に失敗しました" },
      { status: 500 },
    );
  }
}

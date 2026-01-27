import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasting-notes - テイスティングノート一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tastingEntryId = searchParams.get("tastingEntryId");

    const where = tastingEntryId
      ? { tastingEntryId: parseInt(tastingEntryId, 10) }
      : {};

    const notes = await prisma.tastingNote.findMany({
      where,
      include: {
        tastingEntry: {
          include: {
            coffeeBean: {
              include: {
                beanMaster: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching tasting notes:", error);
    return NextResponse.json(
      { error: "テイスティングノートの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST /api/tasting-notes - テイスティングノート作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tastingEntryId,
      recordedBy,
      acidity,
      bitterness,
      sweetness,
      body: bodyValue,
      aftertaste,
      flavorTags,
      overallRating,
      notes,
    } = body;

    // バリデーション: tastingEntryIdは必須
    if (!tastingEntryId) {
      return NextResponse.json(
        { error: "試飲記録IDは必須です" },
        { status: 400 },
      );
    }

    // 試飲記録の存在確認
    const tastingEntry = await prisma.tastingEntry.findUnique({
      where: { id: tastingEntryId },
    });

    if (!tastingEntry) {
      return NextResponse.json(
        { error: "指定された試飲記録が見つかりません" },
        { status: 400 },
      );
    }

    // 評価値のバリデーション（1-5の範囲）
    const ratingFields = {
      acidity,
      bitterness,
      sweetness,
      aftertaste,
      overallRating,
    };
    for (const [field, value] of Object.entries(ratingFields)) {
      if (value !== undefined && value !== null) {
        if (typeof value !== "number" || value < 1 || value > 5) {
          return NextResponse.json(
            { error: `${field}は1-5の範囲で指定してください` },
            { status: 400 },
          );
        }
      }
    }

    // ボディのバリデーション
    if (bodyValue && !["LIGHT", "MEDIUM", "HEAVY"].includes(bodyValue)) {
      return NextResponse.json(
        { error: "ボディはLIGHT/MEDIUM/HEAVYのいずれかを指定してください" },
        { status: 400 },
      );
    }

    // テイスティングノートを作成
    const note = await prisma.tastingNote.create({
      data: {
        tastingEntryId,
        recordedBy: recordedBy || null,
        acidity: acidity ?? null,
        bitterness: bitterness ?? null,
        sweetness: sweetness ?? null,
        body: bodyValue ?? null,
        aftertaste: aftertaste ?? null,
        flavorTags: flavorTags ? JSON.stringify(flavorTags) : null,
        overallRating: overallRating ?? null,
        notes: notes || null,
      },
      include: {
        tastingEntry: {
          include: {
            coffeeBean: true,
          },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating tasting note:", error);
    return NextResponse.json(
      { error: "テイスティングノートの作成に失敗しました" },
      { status: 500 },
    );
  }
}

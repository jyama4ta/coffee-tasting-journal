import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasting-notes/[id] - テイスティングノート詳細取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const noteId = parseInt(id, 10);

    if (isNaN(noteId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    const note = await prisma.tastingNote.findUnique({
      where: { id: noteId },
      include: {
        tastingEntry: {
          include: {
            coffeeBean: {
              include: {
                beanMaster: true,
              },
            },
            dripper: true,
            filter: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "テイスティングノートが見つかりません" },
        { status: 404 },
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching tasting note:", error);
    return NextResponse.json(
      { error: "テイスティングノートの取得に失敗しました" },
      { status: 500 },
    );
  }
}

// PUT /api/tasting-notes/[id] - テイスティングノート更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const noteId = parseInt(id, 10);

    if (isNaN(noteId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // 存在確認
    const existing = await prisma.tastingNote.findUnique({
      where: { id: noteId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "テイスティングノートが見つかりません" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const {
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

    // 更新データを構築
    const updateData: Record<string, unknown> = {};
    if (recordedBy !== undefined) updateData.recordedBy = recordedBy || null;
    if (acidity !== undefined) updateData.acidity = acidity;
    if (bitterness !== undefined) updateData.bitterness = bitterness;
    if (sweetness !== undefined) updateData.sweetness = sweetness;
    if (bodyValue !== undefined) updateData.body = bodyValue;
    if (aftertaste !== undefined) updateData.aftertaste = aftertaste;
    if (flavorTags !== undefined) {
      updateData.flavorTags = flavorTags ? JSON.stringify(flavorTags) : null;
    }
    if (overallRating !== undefined) updateData.overallRating = overallRating;
    if (notes !== undefined) updateData.notes = notes || null;

    const updatedNote = await prisma.tastingNote.update({
      where: { id: noteId },
      data: updateData,
      include: {
        tastingEntry: {
          include: {
            coffeeBean: true,
          },
        },
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating tasting note:", error);
    return NextResponse.json(
      { error: "テイスティングノートの更新に失敗しました" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasting-notes/[id] - テイスティングノート削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const noteId = parseInt(id, 10);

    if (isNaN(noteId)) {
      return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
    }

    // 存在確認
    const existing = await prisma.tastingNote.findUnique({
      where: { id: noteId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "テイスティングノートが見つかりません" },
        { status: 404 },
      );
    }

    await prisma.tastingNote.delete({
      where: { id: noteId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting tasting note:", error);
    return NextResponse.json(
      { error: "テイスティングノートの削除に失敗しました" },
      { status: 500 },
    );
  }
}

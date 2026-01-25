import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/shops - 全店舗を取得
export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(shops)
  } catch (error) {
    console.error('Failed to fetch shops:', error)
    return NextResponse.json(
      { error: '店舗の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/shops - 新規店舗を作成
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // バリデーション: 店舗名は必須
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: '店舗名は必須です' },
        { status: 400 }
      )
    }

    const shop = await prisma.shop.create({
      data: {
        name: body.name.trim(),
        address: body.address || null,
        url: body.url || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(shop, { status: 201 })
  } catch (error) {
    console.error('Failed to create shop:', error)
    return NextResponse.json(
      { error: '店舗の作成に失敗しました' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // 必須フィールドのバリデーション
    if (!data.name || !data.basePrice || !data.unit || !data.categoryId) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      )
    }

    // オプションIDの配列をカンマ区切りの文字列に変換
    const usageOptionIds = data.usageOptionIds && Array.isArray(data.usageOptionIds) 
      ? data.usageOptionIds.join(',') 
      : null
    const flavorOptionIds = data.flavorOptionIds && Array.isArray(data.flavorOptionIds) 
      ? data.flavorOptionIds.join(',') 
      : null

    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: '指定されたカテゴリが存在しません' },
        { status: 400 }
      )
    }

    // 商品を作成
    const newProduct = await prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        priceType: 'WEIGHT_BASED', // デフォルトは重量ベース
        basePrice: parseInt(data.basePrice),
        unit: data.unit.trim(),
        imageUrl: data.imageUrl?.trim() || null,
        hasStock: data.hasStock ?? true,
        isActive: data.isActive ?? true,
        usageOptionIds,
        flavorOptionIds,
        quantityMethods: data.quantityMethods || 'WEIGHT',
        hasRemarks: data.hasRemarks ?? false,
        priority: data.priority ? parseInt(data.priority) : 3,
        categories: {
          create: {
            categoryId: data.categoryId
          }
        }
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
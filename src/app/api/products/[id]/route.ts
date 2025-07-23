import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // JSONフィールドを適切な形式に変換
    const responseProduct = {
      ...product,
      usageOptions: product.usageOptions ? JSON.parse(product.usageOptions as string) : [],
      flavorOptions: product.flavorOptions ? JSON.parse(product.flavorOptions as string) : [],
    }

    return NextResponse.json(responseProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
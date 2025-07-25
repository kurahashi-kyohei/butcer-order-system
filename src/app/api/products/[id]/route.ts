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

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // 用途オプションの取得
    let usageOptions: string[] = []
    let hasUsageOption = false
    if (product.usageOptionIds) {
      const usageOptionIdList = product.usageOptionIds.split(',')
      const usageOptionsData = await prisma.usageOption.findMany({
        where: {
          id: { in: usageOptionIdList },
          isActive: true
        },
        orderBy: { sortOrder: 'asc' }
      })
      usageOptions = usageOptionsData.map(option => option.name)
      hasUsageOption = usageOptions.length > 0
    }

    // 味付けオプションの取得
    let flavorOptions: string[] = []
    let hasFlavorOption = false
    if (product.flavorOptionIds) {
      const flavorOptionIdList = product.flavorOptionIds.split(',')
      const flavorOptionsData = await prisma.flavorOption.findMany({
        where: {
          id: { in: flavorOptionIdList },
          isActive: true
        },
        orderBy: { sortOrder: 'asc' }
      })
      flavorOptions = flavorOptionsData.map(option => option.name)
      hasFlavorOption = flavorOptions.length > 0
    }

    const responseProduct = {
      ...product,
      categories: product.categories.map(pc => pc.category),
      hasUsageOption,
      usageOptions,
      hasFlavorOption,
      flavorOptions,
      quantityMethods: product.quantityMethods ? product.quantityMethods.split(',') : ['WEIGHT'],
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
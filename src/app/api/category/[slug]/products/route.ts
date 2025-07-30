import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'default'
    const skip = (page - 1) * limit

    // カテゴリを取得
    const category = await prisma.category.findUnique({
      where: { 
        slug: params.slug,
        isActive: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // ソート条件を構築
    const getOrderBy = (sortValue: string) => {
      switch (sortValue) {
        case 'name-desc':
          return [{ name: 'desc' as const }]
        case 'price-asc':
          return [{ basePrice: 'asc' as const }]
        case 'price-desc':
          return [{ basePrice: 'desc' as const }]
        case 'created-desc':
          return [{ createdAt: 'desc' as const }]
        case 'created-asc':
          return [{ createdAt: 'asc' as const }]
        case 'name-asc':
          return [{ name: 'asc' as const }]
        default:
          // デフォルトは優先順位順（1が最高優先度）、次に名前順
          return [{ priority: 'asc' as const }, { name: 'asc' as const }]
      }
    }

    const where = {
      isActive: true,
      categories: {
        some: {
          categoryId: category.id
        }
      }
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
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
        },
        orderBy: getOrderBy(sort),
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // 商品データを変換
    const transformedProducts = products.map(product => ({
      ...product,
      category: product.categories.length > 0 ? product.categories[0].category : null,
      categories: product.categories.map(pc => pc.category)
    }))

    return NextResponse.json({
      category,
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching category products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category products' },
      { status: 500 }
    )
  }
}
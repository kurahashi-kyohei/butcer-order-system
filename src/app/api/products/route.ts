import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'default'
    const skip = (page - 1) * limit

    const where = {
      isActive: true,
      ...(categoryId && { 
        categories: {
          some: {
            categoryId: categoryId
          }
        }
      })
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

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/features/ProductGrid'
import { ProductSort, SortOption } from '@/components/features/ProductSort'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    sort?: string
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || '1')
  const sort = (searchParams.sort || 'default') as SortOption
  const limit = 12

  // カテゴリを取得
  const category = await prisma.category.findUnique({
    where: { 
      slug: params.slug,
      isActive: true
    }
  })

  if (!category) {
    notFound()
  }

  // ソート条件を構築
  const getOrderBy = (sortValue: SortOption) => {
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
      case 'default':
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
                slug: true,
                sortOrder: true
              }
            }
          }
        }
      },
      orderBy: getOrderBy(sort),
      skip: (currentPage - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)
  
  // 商品データを変換（categories配列をcategoryの形式に変換）
  const transformedProducts = products.map(product => ({
    ...product,
    category: product.categories.length > 0 ? product.categories[0].category : null,
    categories: product.categories.map(pc => pc.category)
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        <p className="text-gray-600">
          {category.name}の商品一覧です（{totalCount}件）
        </p>
      </div>

      <ProductSort currentSort={sort} />

      <ProductGrid 
        products={transformedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  )
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true }
  })

  return categories.map((category) => ({
    slug: category.slug,
  }))
}
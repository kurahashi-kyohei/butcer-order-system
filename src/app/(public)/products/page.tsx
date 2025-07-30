import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/features/ProductGrid'
import { CategoryFilter } from '@/components/features/CategoryFilter'
import { ProductSort, SortOption } from '@/components/features/ProductSort'

interface PageProps {
  searchParams: {
    categorySlug?: string
    page?: string
    sort?: string
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || '1')
  const categorySlug = searchParams.categorySlug
  const sort = (searchParams.sort || 'default') as SortOption
  const limit = 12

  // カテゴリスラッグから該当するカテゴリを取得
  const selectedCategory = categorySlug 
    ? await prisma.category.findUnique({ where: { slug: categorySlug } })
    : null

  const where = {
    isActive: true,
    ...(selectedCategory && {
      categories: {
        some: {
          categoryId: selectedCategory.id
        }
      }
    })
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

  const [products, categories, totalCount] = await Promise.all([
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
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
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
          {selectedCategory ? selectedCategory.name : '全商品'}
        </h1>
        <p className="text-gray-600">
          {selectedCategory 
            ? `${selectedCategory.name}の商品一覧です` 
            : '全ての商品をご覧いただけます'
          }
        </p>
      </div>

      <CategoryFilter 
        categories={categories}
        selectedCategorySlug={categorySlug}
      />

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
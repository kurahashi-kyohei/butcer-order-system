import { prisma } from '@/lib/prisma'
import { ProductGrid } from '@/components/features/ProductGrid'
import { CategoryFilter } from '@/components/features/CategoryFilter'

interface PageProps {
  searchParams: {
    categoryId?: string
    page?: string
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const currentPage = parseInt(searchParams.page || '1')
  const categoryId = searchParams.categoryId
  const limit = 12

  const where = {
    isActive: true,
    ...(categoryId && { categoryId })
  }

  const [products, categories, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { name: 'asc' }
      ],
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
  const selectedCategory = categoryId 
    ? categories.find(cat => cat.id === categoryId)
    : null

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
        selectedCategoryId={categoryId}
      />

      <ProductGrid 
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  )
}
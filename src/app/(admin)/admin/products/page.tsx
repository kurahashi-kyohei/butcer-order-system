import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductsPageClient } from '@/components/admin/ProductsPageClient'
import { ProductCreateButton } from '@/components/admin/ProductCreateButton'

interface PageProps {
  searchParams: {
    page?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    categoryId?: string
    status?: string
    hasStock?: string
    search?: string
  }
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const currentPage = parseInt(searchParams.page || '1')
  const sortBy = searchParams.sortBy || 'name'
  const sortOrder = searchParams.sortOrder || 'asc'
  const categoryId = searchParams.categoryId
  const status = searchParams.status
  const hasStock = searchParams.hasStock
  const search = searchParams.search
  const limit = 20

  // ソート条件を構築
  const getOrderBy = () => {
    switch (sortBy) {
      case 'name':
        return { name: sortOrder }
      case 'basePrice':
        return { basePrice: sortOrder }
      case 'isActive':
        return { isActive: sortOrder }
      case 'hasStock':
        return { hasStock: sortOrder }
      default:
        return { name: sortOrder }
    }
  }

  // フィルタ条件を構築
  const where: Record<string, any> = {}
  
  // カテゴリフィルタ
  if (categoryId) {
    where.categories = {
      some: {
        categoryId: categoryId
      }
    }
  }
  
  // ステータスフィルタ
  if (status !== undefined) {
    where.isActive = status === 'true'
  }
  
  // 在庫フィルタ
  if (hasStock !== undefined) {
    where.hasStock = hasStock === 'true'
  }
  
  // 検索フィルタ
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
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
                slug: true
              }
            }
          }
        }
      },
      orderBy: getOrderBy(),
      skip: (currentPage - 1) * limit,
      take: limit
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.product.count({ where })
  ])

  // 商品データを変換
  const transformedProducts = products.map(product => ({
    ...product,
    categories: product.categories.map(pc => pc.category)
  }))

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <>
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
            <p className="text-gray-600">商品の確認・編集を行えます</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <ProductCreateButton categories={categories} />
          </div>
        </div>

        <ProductsPageClient 
          initialProducts={transformedProducts}
          categories={categories}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          currentSort={{ sortBy, sortOrder }}
          initialFilters={{
            categoryId: categoryId || undefined,
            status: status || undefined,
            hasStock: hasStock || undefined,
            search: search || undefined
          }}
        />
      </main>
    </>
  )
}
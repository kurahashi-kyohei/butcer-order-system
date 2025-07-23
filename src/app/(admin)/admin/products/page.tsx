import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductsTable } from '@/components/admin/ProductsTable'

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
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
      ]
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    })
  ])

  return (
    <>
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-600">商品の確認・編集を行えます</p>
        </div>

        <ProductsTable 
          products={products}
          categories={categories}
        />
      </main>
    </>
  )
}
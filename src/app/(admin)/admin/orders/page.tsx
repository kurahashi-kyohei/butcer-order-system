import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { OrderFilters } from '@/components/admin/OrderFilters'

interface PageProps {
  searchParams: {
    status?: string
    date?: string
    page?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const currentPage = parseInt(searchParams.page || '1')
  const status = searchParams.status
  const dateFilter = searchParams.date
  const sortBy = searchParams.sortBy || 'createdAt'
  const sortOrder = searchParams.sortOrder || 'desc'
  const limit = 20

  // フィルタ条件を構築
  const where: any = {}
  
  if (status && status !== 'ALL') {
    where.status = status
  }

  if (dateFilter) {
    const targetDate = new Date(dateFilter)
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))
    
    where.pickupDate = {
      gte: startOfDay,
      lte: endOfDay
    }
  }

  // ソート条件を構築
  const getOrderBy = () => {
    switch (sortBy) {
      case 'orderNumber':
        return { orderNumber: sortOrder }
      case 'customerName':
        return { customerName: sortOrder }
      case 'pickupDate':
        return { pickupDate: sortOrder }
      case 'totalAmount':
        return { totalAmount: sortOrder }
      case 'status':
        return { status: sortOrder }
      default:
        return { createdAt: sortOrder }
    }
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: { 
                name: true,
                unit: true,
                quantityMethods: true
              }
            }
          }
        }
      },
      orderBy: getOrderBy(),
      skip: (currentPage - 1) * limit,
      take: limit
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <>
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">注文管理</h1>
          <p className="text-gray-600">注文の確認・ステータス更新を行えます</p>
        </div>

        <OrderFilters 
          currentStatus={status}
          currentDate={dateFilter}
        />

        <OrdersTable 
          orders={orders}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          currentSort={{ sortBy, sortOrder }}
        />
      </main>
    </>
  )
}
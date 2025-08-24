import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { OrderDetailView } from '@/components/admin/OrderDetailView'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface PageProps {
  params: { id: string }
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      orderItems: {
        include: {
          product: {
            select: { 
              name: true,
              unit: true,
              priceType: true,
              quantityMethods: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  return (
    <>
      <AdminHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">注文詳細</h1>
            <p className="text-gray-600">注文番号: {order.orderNumber}</p>
          </div>
          
          <Link href="/admin/orders">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              ← 注文一覧に戻る
            </Button>
          </Link>
        </div>

        <OrderDetailView order={order} />
      </main>
    </>
  )
}
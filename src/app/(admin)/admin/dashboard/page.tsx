import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { AdminHeader } from '@/components/admin/AdminHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // ダッシュボード用データを取得
  const [
    totalOrders,
    pendingOrders,
    todayOrders,
    totalProducts,
    activeProducts,
    recentOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      }
    })
  ])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <>
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">ブッチャー丸幸 管理画面</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総注文数</CardTitle>
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">未処理注文</CardTitle>
              <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日の注文</CardTitle>
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{todayOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">商品数</CardTitle>
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeProducts}</div>
              <p className="text-xs text-gray-500">
                全{totalProducts}商品中
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近の注文 */}
          <Card>
            <CardHeader>
              <CardTitle>最近の注文</CardTitle>
              <CardDescription>最新の5件の注文</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        注文番号: {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerName} - {formatDateTime(order.createdAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        商品数: {order.orderItems.length}点
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'READY' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' ? '未処理' :
                         order.status === 'PREPARING' ? '準備中' :
                         order.status === 'READY' ? '準備完了' :
                         order.status === 'COMPLETED' ? '完了' : 'キャンセル'}
                      </p>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">注文がありません</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使用する管理機能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  注文管理
                </Button>
              </Link>
              
              <Link href="/admin/products" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  商品管理
                </Button>
              </Link>

              <Link href="/" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  サイトを確認
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
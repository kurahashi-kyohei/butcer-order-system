'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface OrderItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  selectedMethod: string
  pieceGrams?: number
  pieceCount?: number
  packCount?: number
  selectedUsage?: string
  selectedFlavor?: string
  remarks?: string
  product: {
    name: string
    unit: string
    quantityMethod: string
    priceType: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: string
  pickupTime: string
  totalAmount: number
  status: string
  createdAt: string
  orderItems: OrderItem[]
}

export function OrderCompleteContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderNumber) {
      setError('注文番号が指定されていません')
      setLoading(false)
      return
    }

    fetchOrder()
  }, [orderNumber, fetchOrder])

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      if (!response.ok) {
        throw new Error('注文情報の取得に失敗しました')
      }
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('注文情報の取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [orderNumber])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const isPriceUndetermined = (order: Order) => {
    if (order.totalAmount === 0) return true
    
    return order.orderItems.some((item: OrderItem) => {
      if (item.subtotal === 0) return true
      if (item.selectedMethod === 'PIECE') return true
      if (item.selectedMethod === 'PIECE_COUNT' && item.product.unit !== '本') return true
      return false
    })
  }

  const isItemPriceUndetermined = (item: OrderItem) => {
    if (item.subtotal === 0) return true
    if (item.selectedMethod === 'PIECE') return true
    if (item.selectedMethod === 'PIECE_COUNT' && item.product.unit !== '本') return true
    return false
  }

  const getSimpleQuantityDisplay = (item: OrderItem) => {
    const method = item.selectedMethod || 'WEIGHT'
    
    switch (method) {
      case 'WEIGHT':
        if (item.packCount && item.packCount > 1) {
          const gramsPerPack = Math.round(item.quantity / item.packCount)
          return `${gramsPerPack}g×${item.packCount}パック`
        }
        return `${item.quantity.toLocaleString()}g`
      case 'PIECE':
        if (item.pieceGrams && item.pieceCount && item.packCount) {
          if (item.packCount > 1) {
            return `${item.pieceGrams}g×${item.pieceCount}枚×${item.packCount}パック`
          } else {
            return `${item.pieceGrams}g×${item.pieceCount}枚`
          }
        }
        return `${item.quantity}枚`
      case 'PACK':
        return `${item.quantity}パック`
      case 'PIECE_COUNT':
        if (item.packCount && item.packCount > 1) {
          const piecesPerPack = Math.round(item.quantity / item.packCount)
          return `${piecesPerPack}本×${item.packCount}パック`
        }
        return `${item.quantity}本`
      default:
        return `${item.quantity}${item.product.unit || ''}`
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-8">
            {error || '注文情報が見つかりません'}
          </p>
          <Link href="/">
            <Button>ホームに戻る</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ご注文ありがとうございます！
        </h1>
        <p className="text-gray-600">
          ご注文を承りました。指定された日時に店舗にお越しください。
        </p>
      </div>

      <div className="space-y-6">
        {/* 注文情報 */}
        <Card>
          <CardHeader>
            <CardTitle>注文情報</CardTitle>
            <CardDescription>
              注文番号: {order.orderNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">お客様名</div>
                <div>{order.customerName}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">メールアドレス</div>
                <div>{order.customerEmail}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">電話番号</div>
                <div>{order.customerPhone}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">受け取り日</div>
                <div>
                  {format(new Date(order.pickupDate), 'M月d日(E)', { locale: ja })}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">受け取り時間</div>
                <div>{order.pickupTime}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">注文日時</div>
                <div>
                  {format(new Date(order.createdAt), 'M月d日(E) HH:mm', { locale: ja })}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">ステータス</div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  注文受付済み
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 注文商品 */}
        <Card>
          <CardHeader>
            <CardTitle>注文商品</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      <div>
                        数量: {getSimpleQuantityDisplay(item)}
                      </div>
                      {item.selectedUsage && (
                        <div>用途: {item.selectedUsage}</div>
                      )}
                      {item.selectedFlavor && (
                        <div>味付け: {item.selectedFlavor}</div>
                      )}
                      {item.remarks && (
                        <div>備考: {item.remarks}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {isItemPriceUndetermined(item) ? '価格未定' : formatPrice(item.subtotal)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isItemPriceUndetermined(item) ? '価格未定' : `${formatPrice(item.price)} × ${item.quantity}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>合計金額</span>
                <span className="text-red-600">
                  {isPriceUndetermined(order) ? '価格未定' : formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 重要なお知らせ */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">重要なお知らせ</CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <ul className="space-y-2 text-sm">
              <li>• お支払いは店舗での現金払いのみとなります</li>
              <li>• 指定された受け取り日時に店舗にお越しください</li>
              <li>• ご不明な点がございましたら店舗までお電話ください</li>
              <li>• 注文のキャンセルや変更は店舗へ直接ご連絡ください</li>
            </ul>
          </CardContent>
        </Card>

        {/* アクション */}
        <div className="text-center space-y-4">
          <Link href="/">
            <Button size="lg">
              続けてお買い物
            </Button>
          </Link>
          
          <div>
            <button
              onClick={() => window.print()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              この画面を印刷する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
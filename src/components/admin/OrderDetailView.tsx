'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface OrderItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  selectedMethod: string
  pieceGrams?: number
  pieceCount?: number
  packCount?: number
  usageOptionName?: string | null
  flavorOptionName?: string | null
  remarks?: string | null
  selectedUsage?: string  // APIからの変換用
  selectedFlavor?: string  // APIからの変換用
  product: {
    name: string
    unit: string
    priceType: string
    quantityMethods?: string
    quantityMethod?: string  // APIからの変換用
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: Date
  pickupTime: string
  totalAmount: number
  status: string
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItem[]
}

interface OrderDetailViewProps {
  order: Order
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(order.status)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const isPriceUndetermined = (order: Order) => {
    // 価格未定の判定: 
    // 1. totalAmountが0の場合
    // 2. または orderItemsに価格未定商品が含まれる場合
    if (order.totalAmount === 0) {
      return true
    }
    
    // orderItemsで価格未定判定（PIECE選択、またはPIECE_COUNT + 100g単位）
    return order.orderItems.some(item => {
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

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '未処理'
      case 'PREPARING': return '準備中'
      case 'READY': return '準備完了'
      case 'COMPLETED': return '受け取り完了'
      case 'CANCELLED': return 'キャンセル'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800'
      case 'PREPARING': return 'bg-blue-100 text-blue-800'
      case 'READY': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuantityDisplay = (item: OrderItem) => {
    const method = item.selectedMethod || 'WEIGHT'
    
    switch (method) {
      case 'WEIGHT':
        // 重量選択: グラム数×パック数
        if (item.packCount) {
          if (item.packCount > 1) {
            const gramsPerPack = Math.round(item.quantity / item.packCount)
            return `${gramsPerPack.toLocaleString()}g × ${item.packCount}パック = ${item.quantity.toLocaleString()}g`
          } else {
            return `${item.quantity.toLocaleString()}g`
          }
        }
        return `${item.quantity.toLocaleString()}g`
      case 'PIECE':
        // 枚数選択: グラム数×枚数×パック数
        if (item.pieceGrams && item.pieceCount && item.packCount) {
          const totalPieces = item.pieceCount * item.packCount
          return `${item.pieceGrams}g × ${totalPieces}枚 (${item.pieceCount}枚×${item.packCount}パック) = ${item.quantity.toLocaleString()}g`
        }
        return `${item.quantity}枚`
      case 'PACK':
        // パック選択: パック数
        return `${item.quantity}パック`
      case 'PIECE_COUNT':
        // 本数選択: 本数×パック数
        if (item.packCount) {
          if (item.packCount > 1) {
            const piecesPerPack = Math.round(item.quantity / item.packCount)
            return `${piecesPerPack}本 × ${item.packCount}パック = ${item.quantity}本`
          } else {
            return `${item.quantity}本`
          }
        }
        return `${item.quantity}本`
      default:
        return `${item.quantity}${item.product.unit || ''}`
    }
  }

  const getMethodLabel = (item: OrderItem) => {
    const method = item.selectedMethod || 'WEIGHT'
    
    switch (method) {
      case 'WEIGHT':
        return '重量指定'
      case 'PIECE':
        return '枚数指定'
      case 'PACK':
        return 'パック指定'
      case 'PIECE_COUNT':
        return '本数指定'
      default:
        return method
    }
  }

  const statusOptions = [
    { value: 'PENDING', label: '未処理' },
    { value: 'PREPARING', label: '準備中' },
    { value: 'READY', label: '準備完了' },
    { value: 'COMPLETED', label: '受け取り完了' },
    { value: 'CANCELLED', label: 'キャンセル' }
  ]

  const handleStatusUpdate = async () => {
    if (currentStatus === order.status) return

    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: currentStatus }),
      })

      if (response.ok) {
        alert('ステータスを更新しました')
        window.location.reload()
      } else {
        alert('ステータスの更新に失敗しました')
        setCurrentStatus(order.status) // 元の値に戻す
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('ステータスの更新に失敗しました')
      setCurrentStatus(order.status) // 元の値に戻す
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePdfDownload = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        const sanitizedOrderNumber = order.orderNumber
          .replace(/[^a-zA-Z0-9\-_]/g, '') // 英数字、ハイフン、アンダースコア以外を除去
          .substring(0, 50) // 最大50文字に制限
        a.download = `order-${sanitizedOrderNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('PDFの生成に失敗しました')
      }
    } catch (error) {
      console.error('PDF download error:', error)
      alert('PDFの生成に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* 注文基本情報 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>注文基本情報</CardTitle>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">注文番号</h4>
                <p className="text-gray-600">{order.orderNumber}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">お客様情報</h4>
                <div className="text-gray-600 space-y-1">
                  <p>名前: {order.customerName}</p>
                  <p>電話: {order.customerPhone}</p>
                  <p>メール: {order.customerEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">受け取り予定</h4>
                <p className="text-gray-600">
                  {formatDate(order.pickupDate)} {order.pickupTime}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">注文日時</h4>
                <p className="text-gray-600">{formatDateTime(order.createdAt)}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">最終更新</h4>
                <p className="text-gray-600">{formatDateTime(order.updatedAt)}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">合計金額</h4>
                <p className="text-2xl font-bold text-red-600">
                  {isPriceUndetermined(order) ? '価格未定' : formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ステータス更新とエクスポート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ステータス管理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  注文ステータス
                </label>
                <CustomSelect
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  options={statusOptions}
                />
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={currentStatus === order.status || isUpdating}
                isLoading={isUpdating}
              >
                ステータス更新
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>エクスポート</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                注文書をPDF形式でダウンロードできます
              </p>
              <Button
                onClick={handlePdfDownload}
                variant="outline"
                className="w-full"
              >
                📄 PDF ダウンロード
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 注文内容詳細 */}
      <Card>
        <CardHeader>
          <CardTitle>注文内容詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-lg">
                      {item.product.name}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      商品 #{index + 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {isItemPriceUndetermined(item) ? '価格未定' : formatPrice(item.subtotal)}
                    </p>
                    <p className="text-sm text-gray-500">
                      単価: {isItemPriceUndetermined(item) ? '価格未定' : formatPrice(item.price)} / {item.product.unit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">数量:</span>
                    <span className="ml-2 text-gray-900 font-semibold">
                      {getQuantityDisplay(item)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {getMethodLabel(item)}
                    </div>
                  </div>

                  {(item.usageOptionName || item.selectedUsage) && (
                    <div>
                      <span className="font-medium text-gray-700">用途:</span>
                      <span className="ml-2 text-gray-900">{item.usageOptionName || item.selectedUsage}</span>
                    </div>
                  )}

                  {(item.flavorOptionName || item.selectedFlavor) && (
                    <div>
                      <span className="font-medium text-gray-700">味付け:</span>
                      <span className="ml-2 text-gray-900">{item.flavorOptionName || item.selectedFlavor}</span>
                    </div>
                  )}
                </div>

                {item.remarks && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">備考:</span>
                    <p className="mt-1 text-gray-900">{item.remarks}</p>
                  </div>
                )}
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-gray-900">商品点数:</span>
                <span className="text-gray-900">{order.orderItems.length}点</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold mt-2">
                <span className="text-gray-900">合計金額:</span>
                <span className="text-red-600">{isPriceUndetermined(order) ? '価格未定' : formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
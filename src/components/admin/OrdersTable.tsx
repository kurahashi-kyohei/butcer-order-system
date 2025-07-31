'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'

interface OrderItem {
  id: string
  quantity: number
  subtotal: number
  selectedUsage?: string
  selectedFlavor?: string
  remarks?: string
  product: {
    name: string
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
  orderItems: OrderItem[]
}

interface OrdersTableProps {
  orders: Order[]
  currentPage: number
  totalPages: number
  totalCount: number
  currentSort: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

export function OrdersTable({ orders, currentPage, totalPages, totalCount, currentSort }: OrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (currentSort.sortBy === field) {
      // 同じフィールドの場合は順序を反転
      params.set('sortOrder', currentSort.sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // 異なるフィールドの場合は新しいフィールドでasc
      params.set('sortBy', field)
      params.set('sortOrder', 'asc')
    }
    
    // ページを1にリセット
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const getSortIcon = (field: string) => {
    if (currentSort.sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    
    if (currentSort.sortOrder === 'asc') {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
        </svg>
      )
    }
  }

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


  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">注文がありません</h3>
          <p className="text-gray-500">指定した条件に一致する注文がありません。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {totalCount}件中 {Math.min((currentPage - 1) * 20 + 1, totalCount)}-{Math.min(currentPage * 20, totalCount)}件を表示
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                    <button
                      onClick={() => handleSort('orderNumber')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>注文情報</span>
                      {getSortIcon('orderNumber')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                    <button
                      onClick={() => handleSort('customerName')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>お客様</span>
                      {getSortIcon('customerName')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                    <button
                      onClick={() => handleSort('pickupDate')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>受け取り予定</span>
                      {getSortIcon('pickupDate')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                    <button
                      onClick={() => handleSort('totalAmount')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>金額</span>
                      {getSortIcon('totalAmount')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>ステータス</span>
                      {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          商品数: {order.orderItems.length}点
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {order.customerPhone}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-32">
                          {order.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(order.pickupDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.pickupTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-red-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                          詳細
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface Product {
  id: string
  name: string
  description?: string | null
  priceType: 'WEIGHT_BASED' | 'PACK'
  basePrice: number
  unit: string
  imageUrl?: string | null
  isActive: boolean
  stock?: number | null
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
  sortOrder: number
}

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    setUpdatingProduct(productId)
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('商品の更新に失敗しました')
      }
    } catch (error) {
      console.error('Product update error:', error)
      alert('商品の更新に失敗しました')
    } finally {
      setUpdatingProduct(null)
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">商品がありません</h3>
          <p className="text-gray-500">商品が登録されていません。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  在庫
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        {formatPrice(product.basePrice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.unit}あたり
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {product.priceType === 'PACK' ? (
                      <div>
                        <p className="text-sm text-gray-900">
                          {product.stock !== null ? `${product.stock}個` : '未設定'}
                        </p>
                        {product.stock !== null && product.stock <= 5 && (
                          <p className="text-xs text-red-500">在庫少</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">量り売り</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant={product.isActive ? "ghost" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        disabled={updatingProduct === product.id}
                        isLoading={updatingProduct === product.id}
                      >
                        {product.isActive ? '無効化' : '有効化'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
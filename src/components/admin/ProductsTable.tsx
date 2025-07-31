'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProductEditModal } from '@/components/admin/ProductEditModal'

interface Product {
  id: string
  name: string
  description?: string | null
  priceType: 'WEIGHT_BASED' | 'PACK'
  basePrice: number
  unit: string
  imageUrl?: string | null
  isActive: boolean
  hasStock: boolean
  categories: {
    id: string
    name: string
    slug: string
  }[]
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
  currentSort: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

export function ProductsTable({ products, categories, currentSort }: ProductsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleUpdate = () => {
    window.location.reload()
  }

  const handleDelete = async (productId: string, productName: string, isCurrentlyActive: boolean) => {
    const action = isCurrentlyActive ? '無効化' : '有効化'
    const actionDetail = isCurrentlyActive 
      ? '商品を無効化し、顧客に表示されなくなります' 
      : '商品を有効化し、顧客に表示されるようになります'
    
    if (!confirm(`「${productName}」を${action}してもよろしいですか？\n\n${actionDetail}`)) {
      return
    }

    setDeletingProductId(productId)

    try {
      if (isCurrentlyActive) {
        // 無効化（論理削除）
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          alert('商品を無効化しました')
          window.location.reload()
        } else {
          const errorData = await response.json()
          alert(errorData.error || '商品の無効化に失敗しました')
        }
      } else {
        // 有効化
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            isActive: true,
            hasStock: true // 有効化時は在庫ありに戻す
          }),
        })

        if (response.ok) {
          alert('商品を有効化しました')
          window.location.reload()
        } else {
          const errorData = await response.json()
          alert(errorData.error || '商品の有効化に失敗しました')
        }
      }
    } catch (error) {
      console.error('Toggle active error:', error)
      alert('操作に失敗しました')
    } finally {
      setDeletingProductId(null)
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
          <table className="w-full min-w-[750px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[160px]">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>商品名</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                  カテゴリ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                  <button
                    onClick={() => handleSort('basePrice')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>価格</span>
                    {getSortIcon('basePrice')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                  <button
                    onClick={() => handleSort('hasStock')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>在庫</span>
                    {getSortIcon('hasStock')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">
                  <button
                    onClick={() => handleSort('isActive')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>ステータス</span>
                    {getSortIcon('isActive')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className={`hover:bg-gray-50 ${!product.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium whitespace-nowrap ${!product.isActive ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {product.name}
                        </p>
                        {!product.isActive && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            無効
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-xs text-gray-500 truncate max-w-36">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map((category) => (
                        <span key={category.id} className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        {formatPrice(product.basePrice)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.unit}あたり
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      product.hasStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.hasStock ? '在庫あり' : '在庫なし'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? '販売中' : '販売停止'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col space-y-1 sm:flex-row sm:space-x-2 sm:space-y-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto text-xs"
                        onClick={() => handleEdit(product)}
                      >
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full sm:w-auto text-xs ${
                          product.isActive 
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                        onClick={() => handleDelete(product.id, product.name, product.isActive)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id 
                          ? '処理中...' 
                          : product.isActive 
                            ? '無効化' 
                            : '有効化'
                        }
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </Card>
  )
}
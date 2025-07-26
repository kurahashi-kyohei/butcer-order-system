'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

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

interface ProductEditModalProps {
  product: Product
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function ProductEditModal({ 
  product, 
  categories, 
  isOpen, 
  onClose, 
  onUpdate 
}: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    basePrice: product.basePrice,
    unit: product.unit,
    imageUrl: product.imageUrl || '',
    hasStock: product.hasStock,
    isActive: product.isActive,
    categoryId: product.categoryId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice,
        unit: product.unit,
        imageUrl: product.imageUrl || '',
        hasStock: product.hasStock,
        isActive: product.isActive,
        categoryId: product.categoryId
      })
    }
  }, [isOpen, product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        alert('商品の更新に失敗しました')
      }
    } catch (error) {
      console.error('Product update error:', error)
      alert('商品の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">商品編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品名 <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品説明
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="商品の説明を入力してください"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                価格 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                単位 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="例: 100g, 1パック"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品画像URL
            </label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <Select
              options={categories.map(cat => ({
                value: cat.id,
                label: cat.name
              }))}
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                在庫状況
              </label>
              <Select
                options={[
                  { value: 'true', label: '在庫あり' },
                  { value: 'false', label: '在庫なし' }
                ]}
                value={formData.hasStock.toString()}
                onChange={(e) => handleChange('hasStock', e.target.value === 'true')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                販売状況
              </label>
              <Select
                options={[
                  { value: 'true', label: '販売中' },
                  { value: 'false', label: '販売停止' }
                ]}
                value={formData.isActive.toString()}
                onChange={(e) => handleChange('isActive', e.target.value === 'true')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              更新
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
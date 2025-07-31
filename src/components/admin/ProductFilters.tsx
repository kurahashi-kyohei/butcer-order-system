'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Input } from '@/components/ui/Input'

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
  sortOrder: number
}

interface ProductFiltersProps {
  categories: Category[]
  onFilter: (filters: {
    categoryId?: string
    status?: string
    hasStock?: string
    search?: string
  }) => void
  initialFilters?: {
    categoryId?: string
    status?: string
    hasStock?: string
    search?: string
  }
}

export function ProductFilters({ categories, onFilter, initialFilters = {} }: ProductFiltersProps) {
  const [categoryId, setCategoryId] = useState<string>(initialFilters.categoryId || 'ALL')
  const [status, setStatus] = useState<string>(initialFilters.status || 'ALL')
  const [hasStock, setHasStock] = useState<string>(initialFilters.hasStock || 'ALL')
  const [search, setSearch] = useState<string>(initialFilters.search || '')

  const categoryOptions = [
    { value: 'ALL', label: '全カテゴリ' },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ]

  const statusOptions = [
    { value: 'ALL', label: '全ステータス' },
    { value: 'true', label: '販売中（有効）' },
    { value: 'false', label: '販売停止（無効）' }
  ]

  const stockOptions = [
    { value: 'ALL', label: '全在庫状況' },
    { value: 'true', label: '在庫あり' },
    { value: 'false', label: '在庫なし' }
  ]

  const handleFilter = () => {
    onFilter({
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
      status: status === 'ALL' ? undefined : status,
      hasStock: hasStock === 'ALL' ? undefined : hasStock,
      search: search.trim() || undefined
    })
  }

  const clearFilters = () => {
    setCategoryId('ALL')
    setStatus('ALL')
    setHasStock('ALL')
    setSearch('')
    onFilter({})
  }

  // フィルター変更時に自動で適用
  useEffect(() => {
    handleFilter()
  }, [categoryId, status, hasStock, search])

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">フィルタ・検索</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ
          </label>
          <CustomSelect
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            販売状況
          </label>
          <CustomSelect
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            在庫状況
          </label>
          <CustomSelect
            value={hasStock}
            onChange={(e) => setHasStock(e.target.value)}
            options={stockOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品名検索
          </label>
          <Input
            type="text"
            placeholder="商品名を入力"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={clearFilters}
          size="sm"
        >
          フィルタをクリア
        </Button>
      </div>
    </div>
  )
}
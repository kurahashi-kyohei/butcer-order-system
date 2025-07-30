'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { ProductFilters } from '@/components/admin/ProductFilters'
import { Pagination } from '@/components/ui/Pagination'

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

interface ProductsPageClientProps {
  initialProducts: Product[]
  categories: Category[]
  currentPage: number
  totalPages: number
  totalCount: number
  currentSort: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  initialFilters?: {
    categoryId?: string
    status?: string
    hasStock?: string
    search?: string
  }
}

export function ProductsPageClient({ 
  initialProducts, 
  categories, 
  currentPage, 
  totalPages, 
  totalCount,
  currentSort,
  initialFilters = {}
}: ProductsPageClientProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<{
    categoryId?: string
    status?: string
    hasStock?: string
    search?: string
  }>(initialFilters)

  const itemsPerPage = 20

  const handleFilter = (newFilters: {
    categoryId?: string
    status?: string
    hasStock?: string
    search?: string
  }) => {
    setFilters(newFilters)
    
    // URLパラメータを構築
    const params = new URLSearchParams()
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId)
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.hasStock) params.set('hasStock', newFilters.hasStock)
    if (newFilters.search) params.set('search', newFilters.search)
    
    // ソート情報を維持
    if (currentSort.sortBy !== 'name') params.set('sortBy', currentSort.sortBy)
    if (currentSort.sortOrder !== 'asc') params.set('sortOrder', currentSort.sortOrder)
    
    const url = params.toString() ? `/admin/products?${params.toString()}` : '/admin/products'
    router.push(url)
  }

  const hasActiveFilters = Object.values(filters).some(filter => filter !== undefined && filter !== '')
  const displayProducts = initialProducts
  const displayTotalCount = totalCount

  return (
    <>
      <ProductFilters 
        categories={categories}
        onFilter={handleFilter}
        initialFilters={filters}
      />

      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {hasActiveFilters ? (
            `フィルタ結果: ${displayProducts.length}件`
          ) : (
            `${totalCount}件中 ${Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}-${Math.min(currentPage * itemsPerPage, totalCount)}件を表示`
          )}
        </p>
      </div>
      
      <ProductsTable 
        products={displayProducts}
        categories={categories}
        currentSort={currentSort}
      />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'created-desc' | 'created-asc'

interface ProductSortProps {
  currentSort?: SortOption
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: '商品名（昇順）' },
  { value: 'name-desc', label: '商品名（降順）' },
  { value: 'price-asc', label: '価格（安い順）' },
  { value: 'price-desc', label: '価格（高い順）' },
  { value: 'created-desc', label: '新着順' },
  { value: 'created-asc', label: '古い順' }
]

export function ProductSort({ currentSort = 'name-asc' }: ProductSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (sortValue: SortOption) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortValue)
    params.delete('page') // ソート変更時はページを1にリセット
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700">並び順:</span>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value as SortOption)}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
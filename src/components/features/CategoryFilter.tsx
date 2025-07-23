'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId?: string
}

export function CategoryFilter({ categories, selectedCategoryId }: CategoryFilterProps) {
  const searchParams = useSearchParams()

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !selectedCategoryId
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全商品
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?categoryId=${category.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategoryId === category.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
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
  selectedCategorySlug?: string
}

export function CategoryFilter({ categories, selectedCategorySlug }: CategoryFilterProps) {
  const searchParams = useSearchParams()

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !selectedCategorySlug
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全商品
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategorySlug === category.slug
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
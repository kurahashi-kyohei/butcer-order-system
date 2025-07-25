'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Category {
  id: string
  name: string
  slug: string
  sortOrder: number
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-serif font-bold text-white">
                ブッチャー丸幸
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation - XL screens only */}
          <nav className="hidden lg:flex items-center space-x-4 flex-1 min-w-0 justify-center">
            <Link 
              href="/products" 
              className="text-gray-300 hover:text-red-400 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
            >
              全商品
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="text-gray-300 hover:text-red-400 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Cart Button - XL screens only */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <Link href="/cart">
              <Button variant="outline" size="sm" className="bg-white text-gray-800 hover:bg-gray-100">
                カート
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - LG and below */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-red-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-expanded="false"
            >
              <span className="sr-only">メニューを開く</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/products"
                className="text-gray-300 hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                全商品
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="text-gray-300 hover:text-red-400 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-600">
              <div className="px-5">
                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full bg-white text-gray-800 hover:bg-gray-100">
                    カート
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams()
  
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `?${params.toString()}`
  }

  // 表示するページ番号の範囲を計算
  const getVisiblePages = () => {
    const delta = 2 // 現在ページの前後に表示するページ数
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    
    const pages: number[] = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const visiblePages = getVisiblePages()

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="ページネーション">
      {/* 前のページ */}
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
        >
          前へ
        </Link>
      ) : (
        <span className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 cursor-not-allowed">
          前へ
        </span>
      )}

      {/* 最初のページ */}
      {visiblePages[0] > 1 && (
        <>
          <Link
            href={createPageURL(1)}
            className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            1
          </Link>
          {visiblePages[0] > 2 && (
            <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
              ...
            </span>
          )}
        </>
      )}

      {/* ページ番号 */}
      {visiblePages.map((page) => (
        page === currentPage ? (
          <span
            key={page}
            className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white bg-red-600 border border-red-600"
            aria-current="page"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={createPageURL(page)}
            className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            {page}
          </Link>
        )
      ))}

      {/* 最後のページ */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
              ...
            </span>
          )}
          <Link
            href={createPageURL(totalPages)}
            className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* 次のページ */}
      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
        >
          次へ
        </Link>
      ) : (
        <span className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 cursor-not-allowed">
          次へ
        </span>
      )}
    </nav>
  )
}
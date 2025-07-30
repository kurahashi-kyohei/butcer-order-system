'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProductCreateModal } from '@/components/admin/ProductCreateModal'

interface Category {
  id: string
  name: string
  slug: string
  isActive: boolean
  sortOrder: number
}

interface ProductCreateButtonProps {
  categories: Category[]
}

export function ProductCreateButton({ categories }: ProductCreateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreate = () => {
    window.location.reload()
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto"
      >
        + 新規商品登録
      </Button>

      <ProductCreateModal
        categories={categories}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
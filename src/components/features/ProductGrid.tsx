import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
  stock?: number | null
  category: {
    id: string
    name: string
    slug: string
  }
}

interface ProductGridProps {
  products: Product[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function ProductGrid({ products, currentPage, totalPages, totalCount }: ProductGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-4.586a1 1 0 00-.707.293L13 15.293a1 1 0 01-.707.293H11a1 1 0 01-.707-.293L6.707 13.293A1 1 0 006 13H2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">商品がありません</h3>
        <p className="text-gray-500">このカテゴリには現在商品が登録されていません。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {totalCount}件中 {Math.min((currentPage - 1) * 12 + 1, totalCount)}-{Math.min(currentPage * 12, totalCount)}件を表示
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-1 truncate">
                    {product.name}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mb-2">
                    {product.category.name}
                  </p>
                </div>
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {formatPrice(product.basePrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.unit}あたり
                    </p>
                  </div>
                </div>

                {product.priceType === 'PACK' && product.stock !== null && (
                  <p className="text-xs text-gray-600">
                    在庫: {product.stock > 0 ? `${product.stock}個` : '在庫切れ'}
                  </p>
                )}

                <Link href={`/products/${product.id}`} className="block">
                  <Button 
                    className="w-full"
                    size="sm"
                    disabled={product.priceType === 'PACK' && product.stock === 0}
                  >
                    {product.priceType === 'PACK' && product.stock === 0 ? '在庫切れ' : '詳細を見る'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}
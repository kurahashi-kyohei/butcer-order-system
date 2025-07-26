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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-4xl">🥩</span>
                )}
              </div>
              <CardTitle className="text-sm md:text-lg line-clamp-2">{product.name}</CardTitle>
              {product.description && (
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-xl md:text-2xl font-bold text-red-600">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="text-xs md:text-sm text-gray-500 ml-1">
                    / {product.unit}
                  </span>
                </div>
                {product.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {product.category.name}
                  </span>
                )}
              </div>

              {product.priceType === 'PACK' && product.stock !== null && product.stock <= 5 && (
                <div className="mb-4">
                  {product.stock === 0 ? (
                    <span className="text-red-600 text-sm">在庫切れ</span>
                  ) : (
                    <span className="text-orange-600 text-sm">残り{product.stock}点</span>
                  )}
                </div>
              )}

              <Link href={`/products/${product.id}`}>
                <Button 
                  className="w-full text-xs md:text-sm"
                  size="sm"
                  disabled={product.priceType === 'PACK' && product.stock === 0}
                >
                  {product.priceType === 'PACK' && product.stock === 0 ? '在庫切れ' : '詳細'}
                </Button>
              </Link>
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
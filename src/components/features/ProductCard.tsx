import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  description?: string
  priceType: 'WEIGHT_BASED' | 'PACK'
  basePrice: number
  unit: string
  imageUrl?: string
  isActive: boolean
  hasStock?: boolean
  categories?: {
    id: string
    name: string
    slug: string
  }[]
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const getPriceDisplay = () => {
    if (product.priceType === 'WEIGHT_BASED') {
      return `${formatPrice(product.basePrice)} / ${product.unit}`
    } else {
      return `${formatPrice(product.basePrice)} / ${product.unit}`
    }
  }

  const getStockDisplay = () => {
    if (product.hasStock === false) {
      return <span className="text-red-600 text-sm">在庫切れ</span>
    }
    return null
  }

  if (!product.isActive) {
    return null
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
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
          <CardDescription className="text-xs md:text-sm line-clamp-2">
            {product.description}
          </CardDescription>
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
          {product.categories && (
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 1).map((category) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {getStockDisplay() && (
          <div className="mb-4">
            {getStockDisplay()}
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
  )
}
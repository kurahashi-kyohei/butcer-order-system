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
  stock?: number
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
    if (product.priceType === 'PACK' && product.stock !== null) {
      if (product.stock === 0) {
        return <span className="text-red-600 text-sm">在庫切れ</span>
      } else if (product.stock <= 5) {
        return <span className="text-orange-600 text-sm">残り{product.stock}点</span>
      }
    }
    return null
  }

  if (!product.isActive) {
    return null
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {product.imageUrl && (
          <div className="aspect-square w-full bg-gray-100 rounded-md mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-sm">画像準備中</span>
          </div>
        )}
        <CardTitle className="text-lg">{product.name}</CardTitle>
        {product.description && (
          <CardDescription>{product.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className="text-xl font-bold text-red-600 mb-2">
            {getPriceDisplay()}
          </div>
          {getStockDisplay()}
        </div>
        
        <div className="mt-4">
          <Link href={`/products/${product.id}`}>
            <Button 
              className="w-full" 
              disabled={product.priceType === 'PACK' && product.stock === 0}
            >
              {product.priceType === 'PACK' && product.stock === 0 ? '在庫切れ' : '詳細を見る'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
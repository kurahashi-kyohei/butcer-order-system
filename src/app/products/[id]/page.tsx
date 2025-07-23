import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductDetailClient } from '@/components/features/ProductDetailClient'

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { 
      id,
      isActive: true 
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })

  if (!product) {
    return null
  }

  return {
    ...product,
    usageOptions: product.usageOptions ? JSON.parse(product.usageOptions as string) : [],
    flavorOptions: product.flavorOptions ? JSON.parse(product.flavorOptions as string) : [],
  }
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          ホーム
        </Link>
        <span>/</span>
        <Link href={`/categories/${product.category.slug}`} className="hover:text-gray-700">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-gray-400">画像準備中</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="text-2xl font-bold text-red-600">
            {getPriceDisplay()}
          </div>

          {product.priceType === 'PACK' && product.stock !== null && (
            <div className="text-sm">
              {product.stock === 0 ? (
                <span className="text-red-600 font-medium">在庫切れ</span>
              ) : product.stock <= 5 ? (
                <span className="text-orange-600">残り{product.stock}点</span>
              ) : (
                <span className="text-green-600">在庫あり</span>
              )}
            </div>
          )}
        </div>
      </div>

      <ProductDetailClient product={product} />
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: '商品が見つかりません',
    }
  }

  return {
    title: `${product.name} | ブッチャー丸幸`,
    description: product.description || `${product.name}の商品詳細ページです。新鮮で高品質な精肉をお届けします。`,
  }
}
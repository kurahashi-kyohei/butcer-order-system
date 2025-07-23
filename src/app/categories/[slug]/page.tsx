import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/features/ProductCard'
import { Button } from '@/components/ui/Button'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }
    }
  })

  return category
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700">
            ホーム
          </Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {category.name}
          </h1>
          <Link href="/">
            <Button variant="outline">
              カテゴリ一覧に戻る
            </Button>
          </Link>
        </div>
      </div>

      {category.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            現在この カテゴリに商品はありません。
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button>
              他のカテゴリを見る
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    return {
      title: 'カテゴリが見つかりません',
    }
  }

  return {
    title: `${category.name} | ブッチャー丸幸`,
    description: `${category.name}の商品一覧ページです。新鮮で高品質な精肉をお届けします。`,
  }
}
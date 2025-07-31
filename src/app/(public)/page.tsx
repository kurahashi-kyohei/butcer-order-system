import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true
    }
  })
  
  return categories
}

async function getFeaturedProducts() {
  // 優先順位1の商品のみを取得
  const products = await prisma.product.findMany({
    where: { 
      isActive: true,
      hasStock: true,
      priority: 1  // 優先順位1の商品のみ
    },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' },
    take: 8
  })

  return products.map(product => ({
    ...product,
    categories: product.categories.map(pc => pc.category)
  }))
}

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts()
  ])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-red-700 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              ブッチャー丸幸
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              お客様の笑顔のため、誠心誠意、真心を込めてお作りいたします。<br />
            </p>
            
            <div className="flex justify-center">
              <Link href="/products">
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-white text-red-700 hover:bg-gray-100 border-0 font-semibold px-8 py-3 text-lg shadow-lg"
                >
                  商品一覧を見る
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 text-sm opacity-90">
              <div className="flex flex-col items-center sm:flex-row justify-center sm:items-start gap-4">
                <div className="flex flex-col items-end">
                  <span>営業時間: 9:00 - 16:30(平日)</span>
                  <span>8:00 - 16:00(土曜)</span>
                </div>
                <span className="hidden sm:inline">|</span>
                <span>定休日: 日曜日、祝日</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* カテゴリページへのリンクセクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              商品カテゴリ
            </h2>
            <p className="text-lg text-gray-600">
              お探しの商品カテゴリを選択してください
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🥩</span>
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      商品を見る
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* おすすめ商品セクション */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              おすすめ商品
            </h2>
            <p className="text-lg text-gray-600">
              厳選された特におすすめの商品をご紹介します
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🥩</span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold">{product.name}</CardTitle>
                  {product.description && (
                    <CardDescription className="text-xs line-clamp-1">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="mb-3">
                    <div className="mb-2">
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(product.basePrice)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        / {product.unit}
                      </span>
                    </div>
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
                  </div>
                  
                  <Link href={`/products/${product.id}`}>
                    <Button size="sm" className="w-full text-xs">
                      詳細を見る
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">現在おすすめ商品はありません</p>
              <Link href="/products">
                <Button>
                  すべての商品を見る
                </Button>
              </Link>
            </div>
          )}
          
          {featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  すべての商品を見る
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 店舗情報セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              店舗情報
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  店舗受け取りについて
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">受け取り希望日の前日までにご注文ください</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">営業時間内（9:00-18:00）にお越しください</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">在庫状況により商品をご用意できない場合があります</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">お支払いは店頭現金払いのみとなります</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-8">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  私たちのこだわり
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">厳選された国産肉を中心に取り扱い</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">新鮮さにこだわった毎日仕入れ</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">お客様のご要望に合わせた加工・味付け</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-600">安心・安全な食材をお届け</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
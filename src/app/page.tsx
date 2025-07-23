import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ブッチャー丸幸へようこそ
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          新鮮で高品質な精肉をご提供いたします。<br />
          店舗受け取り専用の注文サイトです。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">焼肉</CardTitle>
            <CardDescription>上質な焼肉用カット肉</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories/yakiniku">
              <Button variant="outline" className="w-full">
                商品を見る
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">すき焼き・しゃぶしゃぶ</CardTitle>
            <CardDescription>薄切り肉各種</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories/sukiyaki-shabu">
              <Button variant="outline" className="w-full">
                商品を見る
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">十勝彩美牛</CardTitle>
            <CardDescription>特選ブランド牛</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories/tokachi-saibi">
              <Button variant="outline" className="w-full">
                商品を見る
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">加工食品</CardTitle>
            <CardDescription>ハンバーグ・ソーセージ等</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories/processed-foods">
              <Button variant="outline" className="w-full">
                商品を見る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="bg-red-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
          ご注文について
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">営業時間</h3>
            <p className="text-gray-600">
              月〜金: 9:00-16:30<br />
              土: 8:00-12:00<br />
              日祝: 定休日
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">受け取り制限</h3>
            <p className="text-gray-600">
              平日11:00-13:00は<br />
              受け取り不可
            </p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">注文締切</h3>
            <p className="text-gray-600">
              受け取り希望時間の<br />
              2時間前まで
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/admin/login">
          <Button variant="ghost" size="sm">
            管理者ログイン
          </Button>
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // NextAuthの標準的な方法でリダイレクトを含むサインイン
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/admin/dashboard'
      })
      
      // NextAuthが自動的にリダイレクトするので、エラーの場合のみ処理
      if (result && result.error) {
        setError('メールアドレスまたはパスワードが正しくありません')
        setIsLoading(false)
      }
      // 成功の場合はNextAuthが自動的にリダイレクトするので何もしない
      
    } catch (error) {
      setError('ログインに失敗しました。もう一度お試しください。')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            管理者ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ブッチャー丸幸 管理画面
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              管理者アカウントでログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="メールアドレスを入力"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  ログイン
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
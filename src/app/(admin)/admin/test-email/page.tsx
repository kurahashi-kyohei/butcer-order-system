'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function TestEmailPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testEmail = async () => {
    setTesting(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test-email')
      const data = await response.json()
      setResult({
        success: data.success,
        message: data.success ? data.message : data.error
      })
    } catch (error) {
      setResult({
        success: false,
        message: 'テストメールの送信中にエラーが発生しました'
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>メール機能テスト</CardTitle>
          <CardDescription>
            注文完了メールの送信機能をテストします
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">テスト前の確認事項:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• SMTP設定が.env.localに正しく設定されていること</li>
              <li>• テスト用メールアドレスが設定されていること</li>
              <li>• SMTPサーバーへの接続が可能であること</li>
            </ul>
          </div>

          <Button 
            onClick={testEmail} 
            disabled={testing}
            className="w-full"
          >
            {testing ? 'テスト中...' : 'テストメールを送信'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="font-medium">
                {result.success ? '✓ 成功' : '✗ エラー'}
              </div>
              <div className="text-sm mt-1">
                {result.message}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>テスト内容:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• お客様名: 上田　ひとし様</li>
              <li>• 受取日時: 2025年7月31日(木) 9:00〜10:00</li>
              <li>• 注文商品: 彩美牛 モモ 700g前後 (長方形)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
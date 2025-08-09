'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { OrderSummary } from '@/components/features/OrderSummary'
import { PickupTimeSelect } from '@/components/features/PickupTimeSelect'

const checkoutSchema = z.object({
  customerName: z.string().min(1, '名前を入力してください'),
  customerEmail: z.string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  customerPhone: z.string()
    .min(1, '電話番号を入力してください')
    .regex(/^[0-9-+()]+$/, '正しい電話番号を入力してください'),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

interface CartItemData {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
  selectedUsage?: string
  selectedFlavor?: string
  remarks?: string
  quantityMethod: 'WEIGHT' | 'PIECE' | 'PACK' | 'PIECE_COUNT'
  priceType: 'WEIGHT_BASED' | 'PACK'
  isPriceUndetermined?: boolean
  pieceDetails?: {
    pieceGrams?: number
    pieceCount?: number
    packCount?: number
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pickupDate, setPickupDate] = useState<Date | null>(null)
  const [pickupTime, setPickupTime] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    loadCartItems()
  }, [])

  const loadCartItems = async () => {
    try {
      const cartData = sessionStorage.getItem('cart')
      if (!cartData) {
        router.push('/cart')
        return
      }

      const items = JSON.parse(cartData)
      if (items.length === 0) {
        router.push('/cart')
        return
      }

      // 商品情報を取得して詳細情報を追加
      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          try {
            const response = await fetch(`/api/products/${item.productId}`)
            if (response.ok) {
              const product = await response.json()
              return {
                id: `${item.productId}-${item.selectedUsage || ''}-${item.selectedFlavor || ''}`,
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                selectedUsage: item.selectedUsage,
                selectedFlavor: item.selectedFlavor,
                remarks: item.remarks,
                quantityMethod: item.selectedMethod || (Array.isArray(product.quantityMethods) ? product.quantityMethods[0] : 'WEIGHT'),
                priceType: product.priceType,
                isPriceUndetermined: item.isPriceUndetermined,
                pieceDetails: item.pieceDetails,
              }
            }
            return null
          } catch (error) {
            console.error('Error fetching product:', error)
            return null
          }
        })
      )
      
      setCartItems(enrichedItems.filter(Boolean) as CartItemData[])
    } catch (error) {
      console.error('Error loading cart:', error)
      router.push('/cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePickupTimeChange = useCallback((date: Date, time: string) => {
    setPickupDate(date)
    setPickupTime(time)
  }, [])

  const onSubmit = async (data: CheckoutForm) => {
    if (!pickupDate || !pickupTime) {
      alert('受け取り日時を選択してください')
      return
    }

    setIsProcessing(true)

    try {
      // 注文番号を生成
      const orderNumber = `ORD-${Date.now()}`
      
      // 合計金額を計算（既に計算済みのsubtotalを使用）
      const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

      // 注文データを準備
      const orderData = {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        pickupDate: pickupDate.toISOString(),
        pickupTime,
        totalAmount,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
          subtotal: Number(item.subtotal),
          selectedMethod: item.quantityMethod || 'WEIGHT',
          pieceGrams: item.pieceDetails?.pieceGrams,
          pieceCount: item.pieceDetails?.pieceCount,
          packCount: item.pieceDetails?.packCount,
          selectedUsage: item.selectedUsage || undefined,
          selectedFlavor: item.selectedFlavor || undefined,
          remarks: item.remarks || undefined,
        }))
      }

      // 注文をサーバーに送信
      console.log('Sending order data:', orderData)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error('注文の処理に失敗しました')
      }

      const order = await response.json()

      // カートをクリア
      sessionStorage.removeItem('cart')

      // 注文完了ページに遷移
      router.push(`/order-complete?orderNumber=${order.orderNumber}`)
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('注文の処理中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">注文手続き</h1>
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">ホーム</Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-gray-700">カート</Link>
          <span className="mx-2">/</span>
          <span>注文手続き</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 顧客情報入力 */}
            <Card>
              <CardHeader>
                <CardTitle>お客様情報</CardTitle>
                <CardDescription>
                  商品のお受け取りに必要な情報をご入力ください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('customerName')}
                    placeholder="山田 太郎"
                    error={errors.customerName?.message}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('customerEmail')}
                    type="email"
                    placeholder="example@email.com"
                    error={errors.customerEmail?.message}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('customerPhone')}
                    placeholder="090-1234-5678"
                    error={errors.customerPhone?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 受け取り日時選択 */}
            <Card>
              <CardHeader>
                <CardTitle>受け取り日時</CardTitle>
                <CardDescription>
                  商品をお受け取りいただく日時を選択してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PickupTimeSelect onTimeChange={handlePickupTimeChange} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <OrderSummary 
                items={cartItems.map(item => ({
                  id: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  priceType: item.priceType,
                  subtotal: item.subtotal,
                  isPriceUndetermined: item.isPriceUndetermined
                }))}
              />

              {/* 注文内容確認 */}
              <Card>
                <CardHeader>
                  <CardTitle>注文商品</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="text-sm">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-gray-600">
                          {item.quantityMethod === 'PIECE' && item.pieceDetails ? 
                            `${item.pieceDetails.pieceGrams}g × ${item.pieceDetails.pieceCount}枚 × ${item.pieceDetails.packCount}パック = ${item.quantity}g` :
                          item.quantityMethod === 'WEIGHT' && item.pieceDetails?.packCount && item.pieceDetails.packCount > 1 ?
                            `${item.quantity}g × ${item.pieceDetails.packCount}パック` :
                          item.quantityMethod === 'PIECE_COUNT' && item.pieceDetails?.packCount && item.pieceDetails.packCount > 1 ?
                            `${item.quantity}本 × ${item.pieceDetails.packCount}パック` :
                            `${item.quantity}${item.quantityMethod === 'WEIGHT' ? 'g' : 
                              item.quantityMethod === 'PIECE' ? '枚' :
                              item.quantityMethod === 'PACK' ? 'パック' : '本'}`
                          }
                          {item.selectedUsage && ` / ${item.selectedUsage}`}
                          {item.selectedFlavor && ` / ${item.selectedFlavor}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isProcessing}
                disabled={isProcessing}
              >
                注文を確定する
              </Button>

              <div className="text-center">
                <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-700">
                  カートに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
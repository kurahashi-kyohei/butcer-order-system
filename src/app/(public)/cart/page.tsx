'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CartItem } from '@/components/features/CartItem'
import { OrderSummary } from '@/components/features/OrderSummary'

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

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItemData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadCartItems()
  }, [])

  const loadCartItems = async () => {
    try {
      const cartData = sessionStorage.getItem('cart')
      if (cartData) {
        const items = JSON.parse(cartData)
        
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
                  quantityMethod: item.selectedMethod || 
                    (Array.isArray(product.quantityMethods) ? product.quantityMethods[0] : 'WEIGHT'),
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
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const removeCartItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedItems)
    saveCartToStorage(updatedItems)
  }

  const saveCartToStorage = (items: CartItemData[]) => {
    const storageItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      selectedMethod: item.quantityMethod,
      selectedUsage: item.selectedUsage,
      selectedFlavor: item.selectedFlavor,
      remarks: item.remarks,
      isPriceUndetermined: item.isPriceUndetermined,
      pieceDetails: item.pieceDetails,
    }))
    sessionStorage.setItem('cart', JSON.stringify(storageItems))
  }

  const clearCart = () => {
    setCartItems([])
    sessionStorage.removeItem('cart')
  }

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return
    
    setIsProcessing(true)
    router.push('/checkout')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">カート</h1>
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span>カート</span>
        </nav>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              カートに商品がありません
            </h2>
            <p className="text-gray-600 mb-8">
              お買い物を始めるために、商品一覧をご覧ください。
            </p>
            <Link href="/products">
              <Button size="lg">
                商品一覧を見る
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">
                商品一覧 ({cartItems.length}点)
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:border-red-300 flex-shrink-0"
              >
                カートを空にする
              </Button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemoveItem={removeCartItem}
                />
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <Link href="/products">
                <Button variant="outline">
                  買い物を続ける
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary 
                items={cartItems.map(item => ({
                  id: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  priceType: item.priceType,
                  subtotal: item.subtotal,
                  isPriceUndetermined: item.isPriceUndetermined
                }))}
                className="mb-6"
              />

              <Button
                onClick={proceedToCheckout}
                size="lg"
                className="w-full"
                isLoading={isProcessing}
                disabled={isProcessing || cartItems.length === 0}
              >
                注文手続きに進む
              </Button>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-gray-500 hover:text-gray-700">
                  買い物を続ける
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
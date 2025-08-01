'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { ProductOptions } from '@/components/features/ProductOptions'
import { QuantitySelector } from '@/components/features/QuantitySelector'

interface Product {
  id: string
  name: string
  description?: string | null
  priceType: 'WEIGHT_BASED' | 'PACK'
  basePrice: number
  unit: string
  imageUrl?: string | null
  isActive: boolean
  hasStock: boolean
  hasUsageOption: boolean
  usageOptions?: string[]
  hasFlavorOption: boolean
  flavorOptions?: string[]
  quantityMethods: ('WEIGHT' | 'PIECE' | 'PACK' | 'PIECE_COUNT')[]
  hasRemarks: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [subtotal, setSubtotal] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<{
    selectedUsage?: string
    selectedFlavor?: string
    remarks?: string
  }>({})
  const [pieceDetails, setPieceDetails] = useState<{
    pieceGrams?: number
    pieceCount?: number
    packCount?: number
  }>({})
  const [remarks, setRemarks] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    // 必須オプションのバリデーション
    if (product.hasUsageOption && product.usageOptions && product.usageOptions.length > 0 && !selectedOptions.selectedUsage) {
      alert('用途を選択してください')
      return
    }

    // 焼肉用途の場合のみ味付けをチェック
    if (selectedOptions.selectedUsage === '焼肉' && product.hasFlavorOption && product.flavorOptions && product.flavorOptions.length > 0 && !selectedOptions.selectedFlavor) {
      alert('味付けを選択してください')
      return
    }

    setIsAddingToCart(true)

    try {
      const cartItem = {
        productId: product.id,
        quantity,
        price: product.basePrice,
        subtotal,
        selectedMethod,
        selectedUsage: selectedOptions.selectedUsage,
        selectedFlavor: selectedOptions.selectedFlavor,
        remarks: remarks,
        pieceDetails: pieceDetails,
      }

      // セッションストレージにカート情報を保存
      const existingCart = JSON.parse(sessionStorage.getItem('cart') || '[]')
      const existingItemIndex = existingCart.findIndex((item: any) => 
        item.productId === cartItem.productId &&
        item.selectedMethod === cartItem.selectedMethod &&
        item.selectedUsage === cartItem.selectedUsage &&
        item.selectedFlavor === cartItem.selectedFlavor &&
        item.remarks === cartItem.remarks
      )

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += cartItem.quantity
        existingCart[existingItemIndex].subtotal += cartItem.subtotal
      } else {
        existingCart.push(cartItem)
      }

      sessionStorage.setItem('cart', JSON.stringify(existingCart))
      
      // カート画面に遷移
      router.push('/cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('カートに追加できませんでした')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>数量・オプション選択</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProductOptions
            hasUsageOption={product.hasUsageOption}
            usageOptions={product.usageOptions}
            hasFlavorOption={product.hasFlavorOption}
            flavorOptions={product.flavorOptions}
            onOptionsChange={setSelectedOptions}
          />

          <QuantitySelector
            priceType={product.priceType}
            quantityMethods={product.quantityMethods}
            basePrice={product.basePrice}
            unit={product.unit}
            hasStock={product.hasStock}
            onQuantityChange={(qty, sub, method, details) => {
              setQuantity(qty)
              setSubtotal(sub)
              setSelectedMethod(method)
              if (details) {
                setPieceDetails(details)
              }
            }}
          />

          {product.hasRemarks && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備考（任意）
              </label>
              <Textarea
                placeholder="特別な要望があればご記入ください"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>注文内容確認</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>商品:</span>
              <span>{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span>数量:</span>
              <span>
                {selectedMethod === 'PIECE' && pieceDetails.pieceGrams && pieceDetails.pieceCount && pieceDetails.packCount ? 
                  `${pieceDetails.pieceGrams}g × ${pieceDetails.pieceCount}枚 × ${pieceDetails.packCount}パック = ${quantity}g` :
                selectedMethod === 'WEIGHT' && pieceDetails.packCount && pieceDetails.packCount > 1 ?
                  `${Math.round(quantity / pieceDetails.packCount)}g × ${pieceDetails.packCount}パック = ${quantity}g` :
                selectedMethod === 'PIECE_COUNT' && pieceDetails.packCount && pieceDetails.packCount > 1 ?
                  `${Math.round(quantity / pieceDetails.packCount)}本 × ${pieceDetails.packCount}パック = ${quantity}本` :
                  `${quantity}${selectedMethod === 'WEIGHT' ? 'g' : 
                    selectedMethod === 'PACK' ? 'パック' : 
                    selectedMethod === 'PIECE_COUNT' ? '本' : '個'}`
                }
              </span>
            </div>
            {selectedOptions.selectedUsage && (
              <div className="flex justify-between">
                <span>用途:</span>
                <span>{selectedOptions.selectedUsage}</span>
              </div>
            )}
            {selectedOptions.selectedFlavor && (
              <div className="flex justify-between">
                <span>味付け:</span>
                <span>{selectedOptions.selectedFlavor}</span>
              </div>
            )}
          </div>

          <hr />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>合計:</span>
            <span className="text-red-600">{formatPrice(subtotal)}</span>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="lg"
            isLoading={isAddingToCart}
            disabled={isAddingToCart || !product.hasStock}
          >
            {!product.hasStock 
              ? '在庫切れ' 
              : 'カートに追加'}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            ※お支払いは店舗での現金払いのみです
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
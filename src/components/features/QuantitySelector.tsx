'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

interface QuantitySelectorProps {
  priceType: 'WEIGHT_BASED' | 'PACK'
  quantityMethod: 'WEIGHT' | 'PIECE' | 'PACK' | 'PIECE_COUNT'
  basePrice: number
  unit: string
  stock?: number | null
  onQuantityChange: (quantity: number, subtotal: number) => void
}

export function QuantitySelector({
  priceType,
  quantityMethod,
  basePrice,
  unit,
  stock,
  onQuantityChange
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState<number>(quantityMethod === 'WEIGHT' ? 100 : 1)

  const getQuantityLabel = () => {
    switch (quantityMethod) {
      case 'WEIGHT':
        return 'グラム数'
      case 'PIECE':
        return '枚数'
      case 'PACK':
        return 'パック数'
      case 'PIECE_COUNT':
        return '本数'
      default:
        return '数量'
    }
  }

  const getQuantityUnit = () => {
    switch (quantityMethod) {
      case 'WEIGHT':
        return 'g'
      case 'PIECE':
        return '枚'
      case 'PACK':
        return 'パック'
      case 'PIECE_COUNT':
        return '本'
      default:
        return '個'
    }
  }

  const calculateSubtotal = (qty: number) => {
    if (priceType === 'WEIGHT_BASED') {
      // 重量単価商品：100g単位の価格 × グラム数 ÷ 100
      return Math.round((basePrice * qty) / 100)
    } else {
      // パック商品：固定価格 × 個数
      return basePrice * qty
    }
  }

  // 初期値を親コンポーネントに通知
  useEffect(() => {
    const initialQuantity = quantityMethod === 'WEIGHT' ? 100 : 1
    const initialSubtotal = calculateSubtotal(initialQuantity)
    onQuantityChange(initialQuantity, initialSubtotal)
  }, []) // 初回マウント時のみ実行

  const handleQuantityChange = (newQuantity: number) => {
    // 重量商品は100g単位、その他は1単位
    const minQuantity = quantityMethod === 'WEIGHT' ? 100 : 1
    if (newQuantity < minQuantity) return
    if (priceType === 'PACK' && stock && newQuantity > stock) return

    setQuantity(newQuantity)
    const subtotal = calculateSubtotal(newQuantity)
    onQuantityChange(newQuantity, subtotal)
  }

  const getPresetOptions = () => {
    if (quantityMethod === 'WEIGHT') {
      return [100, 200, 300, 500, 1000]
    } else if (quantityMethod === 'PIECE') {
      return [1, 2, 3, 5, 10]
    } else if (quantityMethod === 'PIECE_COUNT') {
      return [1, 2, 3, 4, 5]
    }
    return []
  }

  const presetOptions = getPresetOptions()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getQuantityLabel()} <span className="text-red-500">*</span>
        </label>
        
        {presetOptions.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">よく選ばれる量：</p>
            <div className="flex flex-wrap gap-2">
              {presetOptions.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(preset)}
                  className={quantity === preset ? 'bg-red-50 border-red-300' : ''}
                >
                  {preset}{getQuantityUnit()}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - (quantityMethod === 'WEIGHT' ? 100 : 1))}
            disabled={quantity <= (quantityMethod === 'WEIGHT' ? 100 : 1)}
          >
            -
          </Button>
          
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              handleQuantityChange(value)
            }}
            className="w-24 text-center"
            min={quantityMethod === 'WEIGHT' ? 100 : 1}
            step={quantityMethod === 'WEIGHT' ? 100 : 1}
            max={priceType === 'PACK' && stock ? stock : undefined}
          />
          
          <span className="text-sm text-gray-600">
            {getQuantityUnit()}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + (quantityMethod === 'WEIGHT' ? 100 : 1))}
            disabled={priceType === 'PACK' && stock ? quantity >= stock : false}
          >
            +
          </Button>
        </div>

        {priceType === 'PACK' && stock && (
          <p className="text-sm text-gray-500 mt-1">
            在庫: {stock}パック
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">小計:</span>
          <span className="text-lg font-bold text-red-600">
            {new Intl.NumberFormat('ja-JP', {
              style: 'currency',
              currency: 'JPY',
            }).format(calculateSubtotal(quantity))}
          </span>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
}

interface CartItemProps {
  item: CartItemData
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const getQuantityUnit = () => {
    switch (item.quantityMethod) {
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
    if (item.priceType === 'WEIGHT_BASED') {
      return Math.round((item.price * qty) / 100)
    } else {
      return item.price * qty
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantity(newQuantity)
    onUpdateQuantity(item.id, newQuantity)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">
            {item.productName}
          </h3>
          
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            {item.selectedUsage && (
              <div>用途: {item.selectedUsage}</div>
            )}
            {item.selectedFlavor && (
              <div>味付け: {item.selectedFlavor}</div>
            )}
            {item.remarks && (
              <div>備考: {item.remarks}</div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(item.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          削除
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-700">数量:</span>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
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
              className="w-20 text-center"
              min={1}
            />
            
            <span className="text-sm text-gray-600">
              {getQuantityUnit()}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">
            {formatPrice(item.price)} × {quantity}{getQuantityUnit()}
          </div>
          <div className="text-lg font-bold text-red-600">
            {formatPrice(calculateSubtotal(quantity))}
          </div>
        </div>
      </div>
    </div>
  )
}
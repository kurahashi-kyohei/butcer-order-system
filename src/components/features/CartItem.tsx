'use client'

import { Button } from '@/components/ui/Button'

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
  pieceDetails?: {
    pieceGrams?: number
    pieceCount?: number
    packCount?: number
  }
}

interface CartItemProps {
  item: CartItemData
  onRemoveItem: (id: string) => void
}

export function CartItem({ item, onRemoveItem }: CartItemProps) {

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
        <div className="text-sm text-gray-700">
          <span className="font-medium">数量: </span>
          {item.quantityMethod === 'PIECE' && item.pieceDetails ? (
            <span>
              {item.pieceDetails.pieceGrams}g × {item.pieceDetails.pieceCount}枚 × {item.pieceDetails.packCount}パック = {item.quantity}g
            </span>
          ) : item.quantityMethod === 'WEIGHT' && item.pieceDetails?.packCount && item.pieceDetails.packCount > 1 ? (
            <span>{item.quantity}g × {item.pieceDetails.packCount}パック</span>
          ) : item.quantityMethod === 'PIECE_COUNT' && item.pieceDetails?.packCount && item.pieceDetails.packCount > 1 ? (
            <span>{item.quantity}本 × {item.pieceDetails.packCount}パック</span>
          ) : (
            <span>{item.quantity}{getQuantityUnit()}</span>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">
            {item.quantityMethod === 'PIECE' && item.pieceDetails ? (
              <span>
                {formatPrice(item.price)} × {item.pieceDetails.pieceCount}枚 × {item.pieceDetails.packCount}パック
              </span>
            ) : item.quantityMethod === 'WEIGHT' && item.pieceDetails?.packCount && item.pieceDetails.packCount > 1 ? (
              <span>
                {formatPrice(item.price)} × {item.quantity}g × {item.pieceDetails.packCount}パック
              </span>
            ) : item.quantityMethod === 'PIECE_COUNT' && item.pieceDetails?.packCount && item.pieceDetails.packCount > 1 ? (
              <span>
                {formatPrice(item.price)} × {item.quantity}本 × {item.pieceDetails.packCount}パック
              </span>
            ) : (
              <span>
                {formatPrice(item.price)} × {item.quantity}{getQuantityUnit()}
              </span>
            )}
          </div>
          <div className="text-lg font-bold text-red-600">
            {formatPrice(item.subtotal)}
          </div>
        </div>
      </div>
    </div>
  )
}
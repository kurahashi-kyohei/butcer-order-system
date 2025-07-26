'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface QuantitySelectorProps {
  priceType: 'WEIGHT_BASED' | 'PACK'
  quantityMethods: ('WEIGHT' | 'PIECE' | 'PACK' | 'PIECE_COUNT')[]
  basePrice: number
  unit: string
  hasStock: boolean
  onQuantityChange: (quantity: number, subtotal: number, selectedMethod: string, details?: { pieceGrams?: number, pieceCount?: number, packCount?: number }) => void
}

export function QuantitySelector({
  priceType,
  quantityMethods,
  basePrice,
  unit,
  hasStock,
  onQuantityChange
}: QuantitySelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(quantityMethods[0])
  const [quantity, setQuantity] = useState<number>(quantityMethods[0] === 'WEIGHT' ? 100 : 1)
  // 枚数選択時の詳細設定用の状態
  const [pieceGrams, setPieceGrams] = useState<number>(100) // 1枚あたりのグラム数
  const [pieceCount, setPieceCount] = useState<number>(1)   // 枚数
  const [packCount, setPackCount] = useState<number>(1)     // パック数

  const getQuantityLabel = (method?: string) => {
    const targetMethod = method || selectedMethod
    switch (targetMethod) {
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

  const getQuantityUnit = (method?: string) => {
    const targetMethod = method || selectedMethod
    switch (targetMethod) {
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

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'WEIGHT':
        return '重量で選ぶ'
      case 'PIECE':
        return '枚数で選ぶ'
      case 'PACK':
        return 'パック数で選ぶ'
      case 'PIECE_COUNT':
        return '本数で選ぶ'
      default:
        return '数量で選ぶ'
    }
  }

  const calculateSubtotal = (qty: number, method?: string) => {
    const targetMethod = method || selectedMethod
    switch (targetMethod) {
      case 'WEIGHT':
        // 重量の場合: g × p
        return Math.round((basePrice * qty) / 100)
      case 'PIECE':
        // 枚数の場合: g × 枚数 × パック数 × p
        return Math.round((basePrice * pieceGrams * pieceCount * packCount) / 100)
      case 'PIECE_COUNT':
        // 本数の場合: 本数 × p
        return basePrice * qty
      case 'PACK':
        // パック数の場合: p
        return basePrice * qty
      default:
        return basePrice * qty
    }
  }

  // 枚数選択時の設定変更を監視
  useEffect(() => {
    if (selectedMethod === 'PIECE') {
      const totalQuantity = pieceGrams * pieceCount * packCount
      const subtotal = calculateSubtotal(0) // 計算は内部で行う
      onQuantityChange(totalQuantity, subtotal, selectedMethod, { pieceGrams, pieceCount, packCount })
    }
  }, [pieceGrams, pieceCount, packCount, selectedMethod])

  // 初期値を親コンポーネントに通知
  useEffect(() => {
    const initialQuantity = selectedMethod === 'WEIGHT' ? 100 : 
                           selectedMethod === 'PIECE' ? pieceGrams * pieceCount * packCount : 1
    const initialSubtotal = calculateSubtotal(initialQuantity)
    const details = selectedMethod === 'PIECE' ? { pieceGrams, pieceCount, packCount } : undefined
    onQuantityChange(initialQuantity, initialSubtotal, selectedMethod, details)
  }, []) // 初回マウント時のみ実行

  // 数量選択方法が変更されたときの処理
  const handleMethodChange = (newMethod: string) => {
    setSelectedMethod(newMethod)
    const newQuantity = newMethod === 'WEIGHT' ? 100 : 1
    setQuantity(newQuantity)
    const subtotal = calculateSubtotal(newQuantity, newMethod)
    onQuantityChange(newQuantity, subtotal, newMethod)
  }

  const handleQuantityChange = (newQuantity: number) => {
    // 重量商品は100g単位、その他は1単位
    const minQuantity = selectedMethod === 'WEIGHT' ? 100 : 1
    if (newQuantity < minQuantity) return
    if (!hasStock) return

    setQuantity(newQuantity)
    const subtotal = calculateSubtotal(newQuantity)
    onQuantityChange(newQuantity, subtotal, selectedMethod)
  }

  const getPresetOptions = () => {
    if (selectedMethod === 'WEIGHT') {
      return [100, 200, 300, 500, 1000]
    } else if (selectedMethod === 'PIECE') {
      return [1, 2, 3, 5, 10]
    } else if (selectedMethod === 'PIECE_COUNT') {
      return [1, 2, 3, 4, 5]
    }
    return []
  }

  const presetOptions = getPresetOptions()

  return (
    <div className="space-y-4">
      {quantityMethods.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            購入方法を選択 <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            options={quantityMethods.map(method => ({
              value: method,
              label: getMethodDisplayName(method)
            }))}
            value={selectedMethod}
            onChange={(e) => handleMethodChange(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getQuantityLabel()} <span className="text-red-500">*</span>
        </label>
        
        {selectedMethod === 'PIECE' ? (
          // 枚数選択時の詳細設定
          <div className="space-y-4">
            {/* 1枚あたりのグラム数 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">1枚あたりのグラム数</label>
              <div className="flex items-center space-x-2 flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPieceGrams(Math.max(100, pieceGrams - 100))}
                  disabled={pieceGrams <= 100}
                >
                  -
                </Button>
                <div className="w-20 h-9 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                  <span className="text-sm font-medium">{pieceGrams}</span>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">g</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPieceGrams(pieceGrams + 100)}
                  disabled={!hasStock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* 枚数 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">枚数</label>
              <div className="flex items-center space-x-2 flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPieceCount(Math.max(1, pieceCount - 1))}
                  disabled={pieceCount <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={pieceCount}
                  onChange={(e) => setPieceCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min={1}
                  disabled={!hasStock}
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">枚</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPieceCount(pieceCount + 1)}
                  disabled={!hasStock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* パック数 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">パック数</label>
              <div className="flex items-center space-x-2 flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPackCount(Math.max(1, packCount - 1))}
                  disabled={packCount <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={packCount}
                  onChange={(e) => setPackCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min={1}
                  disabled={!hasStock}
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">パック</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPackCount(packCount + 1)}
                  disabled={!hasStock}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // 従来の数量選択UI
          <>
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

            <div className="flex items-center space-x-2 flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - (selectedMethod === 'WEIGHT' ? 100 : 1))}
                disabled={quantity <= (selectedMethod === 'WEIGHT' ? 100 : 1)}
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
                min={selectedMethod === 'WEIGHT' ? 100 : 1}
                step={selectedMethod === 'WEIGHT' ? 100 : 1}
                disabled={!hasStock}
              />
              
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {getQuantityUnit()}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + (selectedMethod === 'WEIGHT' ? 100 : 1))}
                disabled={!hasStock}
              >
                +
              </Button>
            </div>
          </>
        )}

        {!hasStock && (
          <p className="text-sm text-red-500 mt-1">
            在庫切れ
          </p>
        )}
      </div>

    </div>
  )
}
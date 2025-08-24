interface OrderSummaryProps {
  items: Array<{
    id: string
    quantity: number
    price: number
    priceType: 'WEIGHT_BASED' | 'PACK'
    subtotal?: number
    isPriceUndetermined?: boolean
  }>
  className?: string
}

export function OrderSummary({ items, className }: OrderSummaryProps) {
  const calculateItemTotal = (item: { quantity: number; price: number; priceType: 'WEIGHT_BASED' | 'PACK'; subtotal?: number; isPriceUndetermined?: boolean }) => {
    // 価格未定の場合は0を返す
    if (item.isPriceUndetermined) {
      return 0
    }
    
    // subtotalが提供されている場合はそれを使用、そうでなければ従来の計算
    if (item.subtotal !== undefined) {
      return item.subtotal
    }
    
    if (item.priceType === 'WEIGHT_BASED') {
      return Math.round((item.price * item.quantity) / 100)
    } else {
      return item.price * item.quantity
    }
  }

  const hasUndeterminedPrice = items.some(item => item.isPriceUndetermined)
  const totalAmount = items.reduce((sum, item) => sum + calculateItemTotal(item), 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">注文合計</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>商品点数:</span>
          <span>{items.length}点</span>
        </div>
        
        <div className="flex justify-between">
          <span>小計:</span>
          <span>{hasUndeterminedPrice ? '価格未定' : formatPrice(totalAmount)}</span>
        </div>
        
        <hr className="my-3" />
        
        <div className="flex justify-between items-center text-lg font-bold">
          <span>合計:</span>
          <span className="text-red-600">
            {hasUndeterminedPrice ? '価格未定' : formatPrice(totalAmount)}
          </span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        ※お支払いは店舗での現金払いのみです<br />
        ※価格は全て税込み表示です
      </div>
    </div>
  )
}
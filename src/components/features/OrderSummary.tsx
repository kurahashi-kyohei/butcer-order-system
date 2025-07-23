interface OrderSummaryProps {
  items: Array<{
    id: string
    quantity: number
    price: number
    priceType: 'WEIGHT_BASED' | 'PACK'
  }>
  className?: string
}

export function OrderSummary({ items, className }: OrderSummaryProps) {
  const calculateItemTotal = (item: { quantity: number; price: number; priceType: 'WEIGHT_BASED' | 'PACK' }) => {
    if (item.priceType === 'WEIGHT_BASED') {
      return Math.round((item.price * item.quantity) / 100)
    } else {
      return item.price * item.quantity
    }
  }

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
          <span>{formatPrice(totalAmount)}</span>
        </div>
        
        <hr className="my-3" />
        
        <div className="flex justify-between items-center text-lg font-bold">
          <span>合計:</span>
          <span className="text-red-600">{formatPrice(totalAmount)}</span>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        ※お支払いは店舗での現金払いのみです<br />
        ※価格は全て税込み表示です
      </div>
    </div>
  )
}
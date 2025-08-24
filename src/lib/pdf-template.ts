interface OrderItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  selectedMethod: string
  pieceGrams?: number
  pieceCount?: number
  packCount?: number
  usageOptionName?: string | null
  flavorOptionName?: string | null
  remarks?: string | null
  product: {
    name: string
    unit: string
    priceType: string
    quantityMethods?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupDate: Date
  pickupTime: string
  totalAmount: number
  status: string
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItem[]
}

export function generateOrderHTML(order: Order): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '未処理'
      case 'PREPARING': return '準備中'
      case 'READY': return '準備完了'
      case 'COMPLETED': return '受け取り完了'
      case 'CANCELLED': return 'キャンセル'
      default: return status
    }
  }

  const isPriceUndetermined = (order: Order) => {
    if (order.totalAmount === 0) return true
    
    return order.orderItems.some((item: OrderItem) => {
      if (item.subtotal === 0) return true
      if (item.selectedMethod === 'PIECE') return true
      if (item.selectedMethod === 'PIECE_COUNT' && item.product.unit !== '本') return true
      return false
    })
  }

  const isItemPriceUndetermined = (item: OrderItem) => {
    if (item.subtotal === 0) return true
    if (item.selectedMethod === 'PIECE') return true
    if (item.selectedMethod === 'PIECE_COUNT' && item.product.unit !== '本') return true
    return false
  }

  const getQuantityDisplay = (item: OrderItem) => {
    const method = item.selectedMethod || 'WEIGHT'
    
    switch (method) {
      case 'WEIGHT':
        if (item.packCount) {
          if (item.packCount > 1) {
            const gramsPerPack = Math.round(item.quantity / item.packCount)
            return `${gramsPerPack.toLocaleString()}g × ${item.packCount}パック = ${item.quantity.toLocaleString()}g`
          } else {
            return `${item.quantity.toLocaleString()}g`
          }
        }
        return `${item.quantity.toLocaleString()}g`
      case 'PIECE':
        if (item.pieceGrams && item.pieceCount && item.packCount) {
          const totalPieces = item.pieceCount * item.packCount
          return `${item.pieceGrams}g × ${totalPieces}枚 (${item.pieceCount}枚×${item.packCount}パック) = ${item.quantity.toLocaleString()}g`
        }
        return `${item.quantity}枚`
      case 'PACK':
        return `${item.quantity}パック`
      case 'PIECE_COUNT':
        if (item.packCount) {
          if (item.packCount > 1) {
            const piecesPerPack = Math.round(item.quantity / item.packCount)
            return `${piecesPerPack}本 × ${item.packCount}パック = ${item.quantity}本`
          } else {
            return `${item.quantity}本`
          }
        }
        return `${item.quantity}本`
      default:
        return `${item.quantity}${item.product.unit || ''}`
    }
  }

  const getMethodLabel = (item: OrderItem) => {
    const method = item.selectedMethod || 'WEIGHT'
    
    switch (method) {
      case 'WEIGHT': return '重量指定'
      case 'PIECE': return '枚数指定'
      case 'PACK': return 'パック指定'
      case 'PIECE_COUNT': return '本数指定'
      default: return method
    }
  }

  const getDayOfWeek = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return days[date.getDay()]
  }

  const getSimpleQuantityDisplay = (item: OrderItem) => {
    const method = item.selectedMethod || 'WEIGHT'
    
    switch (method) {
      case 'WEIGHT':
        if (item.packCount && item.packCount > 1) {
          const gramsPerPack = Math.round(item.quantity / item.packCount)
          return `${gramsPerPack}g×${item.packCount}パック`
        }
        return `${item.quantity.toLocaleString()}g`
      case 'PIECE':
        if (item.pieceGrams && item.pieceCount && item.packCount) {
          if (item.packCount > 1) {
            return `${item.pieceGrams}g×${item.pieceCount}枚×${item.packCount}パック`
          } else {
            return `${item.pieceGrams}g×${item.pieceCount}枚`
          }
        }
        return `${item.quantity}枚`
      case 'PACK':
        return `${item.quantity}パック`
      case 'PIECE_COUNT':
        if (item.packCount && item.packCount > 1) {
          const piecesPerPack = Math.round(item.quantity / item.packCount)
          return `${piecesPerPack}本×${item.packCount}パック`
        }
        return `${item.quantity}本`
      default:
        return `${item.quantity}${item.product.unit || ''}`
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>注文書</title>
      <style>
        @page {
          size: A4;
          margin: 2cm 1.5cm;
        }
        body {
          font-family: 'MS Gothic', 'Yu Gothic', 'Hiragino Sans', sans-serif;
          margin: 0;
          padding: 0;
          font-size: 18px;
          line-height: 1.2;
          color: #000;
          background: #fff;
          width: 100%;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 26px;
          font-weight: bold;
          letter-spacing: 0.6em;
          margin: 0;
          padding: 8px 0;
          border-bottom: 1px solid #000;
          line-height: 1.2;
        }
        .customer-section {
          margin-bottom: 80px;
          position: relative;
          min-height: 120px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .customer-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          max-width: 600px;
        }
        .customer-left {
          text-align: center;
          border-bottom: 1px solid #000;
          min-width: 280px;
        }
        .customer-right {
          text-align: right;
          min-width: 280px;
        }
        .customer-name {
          font-size: 20px;
          text-align: center;
        }
        .customer-phone {
          font-size: 20px;
          padding-bottom: 2px;
          text-align: center;
        }
        .pickup-section {
          text-align: right;
        }
        .pickup-label {
          font-size: 20px;
          font-weight: normal;
        }
        .order-section {
          margin-top: 30px;
        }
        .order-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 1px solid #000;
          min-width: 500px;
          width: 100%;
        }
        .order-header h2 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          display: inline-block;
        }
        .order-list {
          list-style: none;
          padding: 0;
          margin: 0;
          line-height: 1.4;
        }
        .order-item {
          font-size: 18px;
          padding: 1px 0;
          line-height: 1.4;
          margin-bottom: 1px;
        }
        .clear {
          clear: both;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>注文書</h1>
        </div>

        <div class="customer-section">
          <div class="customer-info">
            <div class="customer-left">
              <div class="customer-name">${order.customerName}　様</div>
              <div class="customer-phone">${order.customerPhone}</div>
            </div>
            <div class="customer-right">
              <div class="pickup-section">
                <div class="pickup-label">受取日時</div>
                <div class="pickup-label">${formatDate(order.pickupDate)}(${getDayOfWeek(order.pickupDate)})</div>
                <div class="pickup-label">${order.pickupTime}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-section">
          <div class="order-header">
            <h2>ご注文内容</h2>
          </div>
          <div class="order-content">
            <ul class="order-list">
              ${order.orderItems.map((item: OrderItem) => {
                const productLine = `${item.product.name}　${getSimpleQuantityDisplay(item)}`
                const optionsArray = []
                if (item.usageOptionName) optionsArray.push(item.usageOptionName)
                if (item.flavorOptionName) optionsArray.push(item.flavorOptionName)
                const optionsText = optionsArray.length > 0 ? `　${optionsArray.join('　')}` : ''
                
                return `<li class="order-item">${productLine}${optionsText}</li>`
              }).join('')}
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export const PDF_CONFIG = {
  format: 'A4' as const,
  printBackground: true,
  margin: {
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm'
  }
}
import nodemailer from 'nodemailer'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  pickupDate: Date
  pickupTime: string
  orderItems: Array<{
    product: {
      name: string
      quantityMethod: string
    }
    quantity: number
    selectedUsage?: string
    selectedFlavor?: string
    remarks?: string
  }>
  totalAmount: number
}

// メール送信設定
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

// 数量の単位を取得
const getQuantityUnit = (quantityMethod: string) => {
  switch (quantityMethod) {
    case 'WEIGHT':
      return 'g前後'
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

// 注文完了メールのテンプレート
const createOrderCompletionEmailTemplate = (orderData: OrderEmailData): string => {
  const { customerName, pickupDate, pickupTime, orderItems } = orderData
  
  // 受取日時の フォーマット
  const formattedDate = format(pickupDate, 'yyyy年M月d日(E)', { locale: ja })
  
  // 注文商品のテキスト生成
  const itemsText = orderItems.map(item => {
    const unit = getQuantityUnit(item.product.quantityMethod)
    let itemLine = `${item.product.name} ${item.quantity}${unit}`
    
    // オプション情報を追加
    const options = []
    if (item.selectedUsage) options.push(item.selectedUsage)
    if (item.selectedFlavor) options.push(item.selectedFlavor)
    if (item.remarks) options.push(item.remarks)
    
    if (options.length > 0) {
      itemLine += `　(${options.join(', ')})`
    }
    
    return itemLine
  }).join('\n')

  return `${customerName}様

この度はご注文ありがとうございます。
ご注文内容の確認をいたします。

【受取日時】
${formattedDate}
${pickupTime}

【ご注文内容】
${itemsText}

こちらでご注文お受けしました。
お待ちしております！

---------------------------------
ブッチャー丸幸
TEL: (011)-851-6398
住所: 〒062-0031　北海道札幌市豊平区西岡1条3丁目10-5
営業時間: 9:00-16:30(平日)　8:00-12:00(土曜)
定休日: 日曜日・祝日
---------------------------------`
}

// 注文完了メールを送信
export const sendOrderCompletionEmail = async (orderData: OrderEmailData): Promise<void> => {
  try {
    console.log('Attempting to send email to:', orderData.customerEmail)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASSWORD
    })

    const emailContent = createOrderCompletionEmailTemplate(orderData)
    console.log('Email content generated:', emailContent.substring(0, 100) + '...')
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: orderData.customerEmail,
      subject: `【ブッチャー丸幸】ご注文ありがとうございます（注文番号: ${orderData.orderNumber}）`,
      text: emailContent
    }

    console.log('Mail options:', { ...mailOptions, text: mailOptions.text.substring(0, 100) + '...' })

    const info = await transporter.sendMail(mailOptions)
    console.log('Order completion email sent successfully:', info.messageId)
  } catch (error) {
    console.error('Failed to send order completion email:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

// メール設定のテスト
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify()
    console.log('Email server connection verified')
    return true
  } catch (error) {
    console.error('Email server connection failed:', error)
    return false
  }
}
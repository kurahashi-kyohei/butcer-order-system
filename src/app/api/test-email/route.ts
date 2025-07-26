import { NextResponse } from 'next/server'
import { sendOrderCompletionEmail, testEmailConnection, type OrderEmailData } from '@/lib/email'

export async function GET() {
  try {
    // メール接続テスト
    const connectionTest = await testEmailConnection()
    
    if (!connectionTest) {
      return NextResponse.json(
        { success: false, error: 'Email server connection failed' },
        { status: 500 }
      )
    }

    // テスト用の注文データ
    const testOrderData: OrderEmailData = {
      customerName: '上田　ひとし',
      customerEmail: 'test@example.com', // 実際のテスト用メールアドレスに変更してください
      orderNumber: 'TEST-12345',
      pickupDate: new Date('2025-07-31'),
      pickupTime: '9:00〜10:00',
      orderItems: [
        {
          product: {
            name: '彩美牛 モモ',
            quantityMethod: 'WEIGHT'
          },
          quantity: 700,
          selectedUsage: '長方形',
          selectedFlavor: undefined,
          remarks: undefined
        },
        {
          product: {
            name: 'サーロインステーキ',
            quantityMethod: 'PIECE_COUNT'
          },
          quantity: 2,
          selectedUsage: undefined,
          selectedFlavor: 'ガーリック風味',
          remarks: undefined
        }
      ],
      totalAmount: 3500
    }

    // テストメール送信
    await sendOrderCompletionEmail(testOrderData)

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    })
  } catch (error) {
    console.error('Test email failed:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
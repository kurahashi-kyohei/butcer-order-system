import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendOrderCompletionEmail, type OrderEmailData } from '@/lib/email'
import { validateOrigin, csrfError } from '@/lib/csrf-protection'

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  selectedMethod: z.string(),
  pieceGrams: z.number().optional(),
  pieceCount: z.number().optional(),
  packCount: z.number().optional(),
  selectedUsage: z.string().optional(),
  selectedFlavor: z.string().optional(),
  remarks: z.string().optional(),
  isPriceUndetermined: z.boolean().optional(),
})

const createOrderSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  pickupDate: z.string(),
  pickupTime: z.string(),
  totalAmount: z.number().nonnegative(),
  items: z.array(orderItemSchema).min(1),
})

export async function POST(request: NextRequest) {
  // CSRF保護
  if (!validateOrigin(request)) {
    return csrfError();
  }

  try {
    const body = await request.json()
    console.log('Received order data:', body)
    const validatedData = createOrderSchema.parse(body)
    console.log('Validated order data:', validatedData)

    // トランザクション内で注文を作成（N+1問題を解決）
    const order = await prisma.$transaction(async (tx) => {
      // 注文を作成し、必要な商品情報を同時に含めて取得
      const newOrder = await tx.order.create({
        data: {
          orderNumber: validatedData.orderNumber,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone,
          pickupDate: new Date(validatedData.pickupDate),
          pickupTime: validatedData.pickupTime,
          totalAmount: validatedData.totalAmount,
          status: 'PENDING',
          orderItems: {
            create: validatedData.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              selectedMethod: item.selectedMethod,
              pieceGrams: item.pieceGrams || null,
              pieceCount: item.pieceCount || null,
              packCount: item.packCount || null,
              usageOptionName: item.selectedUsage,
              flavorOptionName: item.selectedFlavor,
              remarks: item.remarks,
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  quantityMethods: true
                }
              }
            }
          }
        }
      })

      // 在庫管理は現在のスキーマでは未実装のためコメントアウト
      // 将来的に在庫管理機能を追加する場合は、Productモデルにstockフィールドを追加してください
      /*
      await Promise.all(
        validatedData.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          })

          if (product && product.priceType === 'PACK' && product.stock !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: Math.max(0, product.stock - item.quantity),
              },
            })
          }
        })
      )
      */

      return newOrder
    })

    // レスポンスを即座に返す
    const response = NextResponse.json(order, { status: 201 })

    // バックグラウンドでメール送信を実行（非同期化）
    setImmediate(async () => {
      try {
        const emailData: OrderEmailData = {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          orderNumber: order.orderNumber,
          pickupDate: order.pickupDate,
          pickupTime: order.pickupTime,
          orderItems: order.orderItems.map(item => ({
            product: {
              name: item.product?.name || '',
              quantityMethod: item.selectedMethod
            },
            quantity: item.quantity,
            selectedUsage: item.usageOptionName || undefined,
            selectedFlavor: item.flavorOptionName || undefined,
            remarks: item.remarks || undefined
          })),
          totalAmount: order.totalAmount
        }

        await sendOrderCompletionEmail(emailData)
        console.log('Order completion email sent successfully')
      } catch (emailError) {
        console.error('Background email sending failed:', emailError)
        // バックグラウンドでのメール送信エラーはログのみ記録
      }
    })

    return response
  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.issues)
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      )
    }

    // Prismaエラーの詳細もログ出力
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error:', error)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '注文の作成中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (orderNumber) {
      // 特定の注文を取得
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  unit: true,
                  quantityMethods: true,
                }
              }
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json(
          { error: '注文が見つかりません' },
          { status: 404 }
        )
      }

      // フロントエンドが期待するフィールド名に変換
      const transformedOrder = {
        ...order,
        orderItems: order.orderItems.map(item => ({
          ...item,
          selectedUsage: item.usageOptionName,
          selectedFlavor: item.flavorOptionName,
          product: {
            ...item.product,
            quantityMethod: item.selectedMethod || (typeof item.product.quantityMethods === 'string' ? item.product.quantityMethods.split(',')[0] : 'WEIGHT')
          }
        }))
      }

      return NextResponse.json(transformedOrder)
    }

    // 全注文を取得（管理者用）
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
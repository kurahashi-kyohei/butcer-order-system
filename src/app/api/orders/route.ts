import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  subtotal: z.number().positive(),
  selectedUsage: z.string().optional(),
  selectedFlavor: z.string().optional(),
  remarks: z.string().optional(),
})

const createOrderSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  pickupDate: z.string(),
  pickupTime: z.string(),
  totalAmount: z.number().positive(),
  items: z.array(orderItemSchema).min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received order data:', body)
    const validatedData = createOrderSchema.parse(body)
    console.log('Validated order data:', validatedData)

    // トランザクション内で注文を作成
    const order = await prisma.$transaction(async (tx) => {
      // 注文を作成
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
        },
      })

      // 注文アイテムを作成
      const orderItems = await Promise.all(
        validatedData.items.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              selectedUsage: item.selectedUsage,
              selectedFlavor: item.selectedFlavor,
              remarks: item.remarks,
            },
          })
        )
      )

      // 在庫を更新（パック商品のみ）
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

      return {
        ...newOrder,
        orderItems,
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors)
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
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
                  quantityMethod: true,
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

      return NextResponse.json(order)
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
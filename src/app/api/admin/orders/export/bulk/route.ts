import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderHTML, PDF_CONFIG } from '@/lib/pdf-template'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderIds } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      )
    }

    // 複数の注文データを取得
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        orderItems: {
          include: {
            product: {
              select: { 
                name: true,
                unit: true,
                priceType: true,
                quantityMethods: true
              }
            }
          }
        }
      }
    })

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found' },
        { status: 404 }
      )
    }

    // Puppeteerを起動 (Vercel環境対応)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    // ZIPファイルを作成
    const zip = new JSZip()

    // 各注文のPDFを生成してZIPに追加
    for (const order of orders) {
      const html = generateOrderHTML(order)
      
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const pdfBuffer = await page.pdf(PDF_CONFIG)

      await page.close()

      // ZIPにPDFファイルを追加
      zip.file(`order-${order.orderNumber}.pdf`, pdfBuffer)
    }

    await browser.close()

    // ZIPファイルを生成
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // ZIPファイルとしてレスポンス
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.zip"`
      }
    })

  } catch (error) {
    console.error('Bulk PDF export error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
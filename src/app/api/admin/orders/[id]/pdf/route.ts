import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderHTML, PDF_CONFIG } from '@/lib/pdf-template'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

interface PageProps {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: PageProps
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 注文データを取得
    const order = await prisma.order.findUnique({
      where: { id: params.id },
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

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // PDF用のHTMLを生成
    const html = generateOrderHTML(order)

    // Puppeteerを使用してPDFを生成 (Vercel環境対応)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf(PDF_CONFIG)

    await browser.close()

    // PDFファイルとしてレスポンス
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="order-${order.orderNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateOrderHTML, PDF_CONFIG } from '@/lib/pdf-template'
import puppeteer from 'puppeteer-core'
import puppeteerFull from 'puppeteer'
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

    // paramsをawaitする (Next.js 15要件)
    const { id } = await params

    // 注文データを取得
    const order = await prisma.order.findUnique({
      where: { id },
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

    // Puppeteerを使用してPDFを生成 (環境対応)
    const isProduction = process.env.NODE_ENV === 'production'
    const browser = isProduction
      ? await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        })
      : await puppeteerFull.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
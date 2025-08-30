import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image')
    
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: '画像ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズのバリデーション
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ファイル内容に基づくタイプ検証（セキュリティ強化）
    const detectedType = await fileTypeFromBuffer(buffer)
    if (!detectedType || !ALLOWED_TYPES.includes(detectedType.mime)) {
      return NextResponse.json(
        { error: 'サポートされていないファイル形式です。JPEG、PNG、WebP形式のみ対応しています。' },
        { status: 400 }
      )
    }

    // ユニークなファイル名を生成
    const fileExtension = path.extname(file.name)
    const uniqueId = crypto.randomUUID()
    const timestamp = Date.now()
    const filename = `${timestamp}-${uniqueId}${fileExtension}`

    // アップロード先のディレクトリを確保
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // ファイルを保存
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // 公開URLを生成
    const publicUrl = `/uploads/products/${filename}`

    return NextResponse.json(
      { 
        success: true,
        url: publicUrl,
        filename: filename
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    )
  }
}
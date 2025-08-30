import { NextResponse } from 'next/server'

export async function GET() {
  // 本番環境ではデバッグAPIを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  // 環境変数をチェック（開発環境のみ）
  const emailConfig = {
    SMTP_HOST: process.env.SMTP_HOST ? '[SET]' : '[NOT SET]',
    SMTP_PORT: process.env.SMTP_PORT ? '[SET]' : '[NOT SET]',
    SMTP_USER: process.env.SMTP_USER ? '[SET]' : '[NOT SET]',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '[SET]' : '[NOT SET]',
  }

  return NextResponse.json({
    message: 'Email configuration debug',
    config: emailConfig,
    hasAllRequiredVars: !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    )
  })
}
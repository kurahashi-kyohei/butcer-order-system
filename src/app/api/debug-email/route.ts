import { NextResponse } from 'next/server'

export async function GET() {
  // 環境変数をチェック
  const emailConfig = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '[SET]' : '[NOT SET]',
  }

  console.log('Email configuration:', emailConfig)

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
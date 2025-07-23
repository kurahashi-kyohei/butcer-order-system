import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SessionProvider } from '@/components/providers/SessionProvider'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ブッチャー丸幸 - 精肉店注文サイト',
  description: '新鮮で高品質な精肉をお届けします。店舗受け取り専用の注文サイトです。',
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </SessionProvider>
  )
}
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import '../globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'ブッチャー丸幸 管理画面',
  description: 'ブッチャー丸幸の管理者専用画面です。',
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </SessionProvider>
  )
}
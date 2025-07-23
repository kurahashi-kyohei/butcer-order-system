'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'ダッシュボード', href: '/admin/dashboard' },
    { name: '注文管理', href: '/admin/orders' },
    { name: '商品管理', href: '/admin/products' },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <header className="bg-white shadow border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-red-600">
                ブッチャー丸幸 管理画面
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {session?.user && (
              <span className="text-sm text-gray-700">
                {session.user.email}
              </span>
            )}
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                サイトを見る
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              ログアウト
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Mobile user info and actions */}
              <div className="pt-4 pb-2 border-t border-gray-200 mt-4">
                {session?.user && (
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-700 font-medium">
                      {session.user.email}
                    </p>
                  </div>
                )}
                <div className="px-3 py-2 space-y-2">
                  <Link href="/" target="_blank" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      サイトを見る
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    ログアウト
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
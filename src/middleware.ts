import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // 管理者エリアへのアクセス制御
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // ログインページは常にアクセス可能
        if (path.startsWith('/admin/login')) {
          return true
        }
        
        // 他の管理者ページは認証が必要
        if (path.startsWith('/admin')) {
          return !!token && token.role === 'ADMIN'
        }
        
        // その他のページは自由にアクセス可能
        return true
      },
    },
  }
)

export const config = {
  matcher: []  // 一時的にミドルウェアを無効化
}
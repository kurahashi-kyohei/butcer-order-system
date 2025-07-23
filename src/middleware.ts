import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // 管理者エリアへのアクセス制御
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 管理者ページは認証が必要
        if (req.nextUrl.pathname.startsWith('/admin') && 
            !req.nextUrl.pathname.startsWith('/admin/login')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}
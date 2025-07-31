import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 相対URLの場合はbaseUrlと結合
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // 同じbaseUrlの場合はそのまま
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // デフォルトはダッシュボード
      return `${baseUrl}/admin/dashboard`
    }
  },
  pages: {
    signIn: '/admin/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true
}

declare module 'next-auth' {
  interface User {
    role: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}
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
        console.log('Authorize called with:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('User found:', !!user)

          if (!user) {
            console.log('User not found')
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          console.log('Password valid:', isValidPassword)
          
          if (!isValidPassword) {
            console.log('Invalid password')
            return null
          }

          console.log('Authentication successful for:', user.email)
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
      console.log('JWT callback - token:', !!token, 'user:', !!user)
      if (user) {
        console.log('Adding role to token:', user.role)
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - session:', !!session, 'token:', !!token)
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        console.log('Session user role:', session.user.role)
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
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
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // 既存の管理者ユーザーをチェック
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@butcher-maruko.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // 管理者ユーザーを作成
    const admin = await prisma.user.create({
      data: {
        email: 'admin@butcher-maruko.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('Admin user created successfully:', admin.email)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
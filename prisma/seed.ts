import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 管理者ユーザーを作成
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@butcher-maruko.com' },
    update: {},
    create: {
      email: 'admin@butcher-maruko.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Admin user created:', admin)

  // カテゴリを作成
  const categories = [
    { name: '焼肉', slug: 'yakiniku', sortOrder: 1 },
    { name: 'すき焼き・しゃぶしゃぶ', slug: 'sukiyaki-shabu', sortOrder: 2 },
    { name: '十勝彩美牛', slug: 'tokachi-saibi', sortOrder: 3 },
    { name: '牛肉', slug: 'beef', sortOrder: 4 },
    { name: '豚肉', slug: 'pork', sortOrder: 5 },
    { name: '鶏肉', slug: 'chicken', sortOrder: 6 },
    { name: '挽肉', slug: 'ground-meat', sortOrder: 7 },
    { name: '加工食品', slug: 'processed-foods', sortOrder: 8 }
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    })
    console.log('Category created:', category)
  }

  // サンプル商品を作成
  const yakinikuCategory = await prisma.category.findUnique({ where: { slug: 'yakiniku' } })
  const processedCategory = await prisma.category.findUnique({ where: { slug: 'processed-foods' } })

  if (yakinikuCategory) {
    await prisma.product.upsert({
      where: { id: 'product-1' },
      update: {},
      create: {
        id: 'product-1',
        name: '国産牛カルビ',
        description: '上質な国産牛のカルビです。焼肉に最適です。',
        priceType: 'WEIGHT_BASED',
        basePrice: 800,
        unit: '100g',
        hasUsageOption: true,
        usageOptions: JSON.stringify(['焼肉用', 'バーベキュー用']),
        hasFlavorOption: true,
        flavorOptions: JSON.stringify(['プレーン', 'タレ漬け']),
        quantityMethod: 'WEIGHT',
        hasRemarks: true,
        categoryId: yakinikuCategory.id
      }
    })
  }

  if (processedCategory) {
    await prisma.product.upsert({
      where: { id: 'product-2' },
      update: {},
      create: {
        id: 'product-2',
        name: '手作りハンバーグ',
        description: '店内で手作りしたハンバーグです。',
        priceType: 'PACK',
        basePrice: 300,
        unit: 'パック',
        stock: 10,
        quantityMethod: 'PACK',
        hasRemarks: false,
        categoryId: processedCategory.id
      }
    })
  }

  console.log('Sample products created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
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

  // オプションを作成
  const usageOptions = [
    { name: '焼肉用', sortOrder: 1 },
    { name: 'バーベキュー用', sortOrder: 2 },
    { name: '煮込み用', sortOrder: 3 },
    { name: 'カレー用', sortOrder: 4 },
    { name: 'すき焼き用', sortOrder: 5 },
    { name: 'しゃぶしゃぶ用', sortOrder: 6 }
  ]

  const createdUsageOptions = []
  for (const optionData of usageOptions) {
    const option = await prisma.usageOption.upsert({
      where: { name: optionData.name },
      update: {},
      create: optionData
    })
    createdUsageOptions.push(option)
    console.log('Usage option created:', option)
  }

  const flavorOptions = [
    { name: 'プレーン', sortOrder: 1 },
    { name: 'タレ漬け', sortOrder: 2 },
    { name: '塩味', sortOrder: 3 },
    { name: '醤油味', sortOrder: 4 },
    { name: '味噌味', sortOrder: 5 }
  ]

  const createdFlavorOptions = []
  for (const optionData of flavorOptions) {
    const option = await prisma.flavorOption.upsert({
      where: { name: optionData.name },
      update: {},
      create: optionData
    })
    createdFlavorOptions.push(option)
    console.log('Flavor option created:', option)
  }

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

  // 焼肉用のオプションIDを取得
  const yakinikuUsage = createdUsageOptions.find(opt => opt.name === '焼肉用')
  const bbqUsage = createdUsageOptions.find(opt => opt.name === 'バーベキュー用')
  const plainFlavor = createdFlavorOptions.find(opt => opt.name === 'プレーン')
  const marinatedFlavor = createdFlavorOptions.find(opt => opt.name === 'タレ漬け')

  if (yakinikuCategory && yakinikuUsage && bbqUsage && plainFlavor && marinatedFlavor) {
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
        usageOptionIds: `${yakinikuUsage.id},${bbqUsage.id}`,
        flavorOptionIds: `${plainFlavor.id},${marinatedFlavor.id}`,
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
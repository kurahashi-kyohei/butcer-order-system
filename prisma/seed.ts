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
    { name: '焼肉', sortOrder: 1 },
    { name: '鍋', sortOrder: 2 },
    { name: 'しゃぶしゃぶ', sortOrder: 3 },
    { name: 'すき焼き', sortOrder: 4 },
    { name: 'ステーキ', sortOrder: 5 },
    { name: 'ジンギスカン', sortOrder: 6 },
    { name: 'その他', sortOrder: 7 }
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
    { name: '自社特製タレ', sortOrder: 1 },
    { name: '塩タレ', sortOrder: 2 },
    { name: '特注ホルモンタレ', sortOrder: 3 },
    { name: '塩胡椒', sortOrder: 4 },
    { name: '自社特製ジンギスカンタレ', sortOrder: 5 },
    { name: 'なし', sortOrder: 6 }
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
    { name: '豚肉', slug: 'pork', sortOrder: 2 },
    { name: 'しゃぶしゃぶ', slug: 'shabu', sortOrder: 3 },
    { name: '牛肉', slug: 'beef', sortOrder: 4 },
    { name: '鶏肉', slug: 'chicken', sortOrder: 5 },
    { name: '十勝彩美牛', slug: 'tokachi-saibi', sortOrder: 6 },
    { name: '挽肉', slug: 'ground-meat', sortOrder: 7 },
    { name: '加工品', slug: 'processed-foods', sortOrder: 8 }
  ]

  const createdCategories: Record<string, any> = {}
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    })
    createdCategories[categoryData.slug] = category
    console.log('Category created:', category)
  }

  // オプションを取得
  const yakinikuUsage = createdUsageOptions.find(opt => opt.name === '焼肉')
  const nabeUsage = createdUsageOptions.find(opt => opt.name === '鍋')
  const shabuUsage = createdUsageOptions.find(opt => opt.name === 'しゃぶしゃぶ')
  const sukiyakiUsage = createdUsageOptions.find(opt => opt.name === 'すき焼き')
  const steakUsage = createdUsageOptions.find(opt => opt.name === 'ステーキ')
  const jingiskanUsage = createdUsageOptions.find(opt => opt.name === 'ジンギスカン')
  const otherUsage = createdUsageOptions.find(opt => opt.name === 'その他')
  
  const jishaSpecialFlavor = createdFlavorOptions.find(opt => opt.name === '自社特製タレ')
  const shioFlavor = createdFlavorOptions.find(opt => opt.name === '塩タレ')
  const horumonFlavor = createdFlavorOptions.find(opt => opt.name === '特注ホルモンタレ')
  const shiokoshoFlavor = createdFlavorOptions.find(opt => opt.name === '塩胡椒')
  const jingiskanFlavor = createdFlavorOptions.find(opt => opt.name === '自社特製ジンギスカンタレ')
  const nashiFlavor = createdFlavorOptions.find(opt => opt.name === 'なし')

  // 商品データ（カテゴリは別途作成）
  const products = [
    // 焼肉カテゴリ
    {
      id: 'beef-sagari',
      name: '牛サガリ',
      description: '牛サガリです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 500,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-tan',
      name: '牛タン',
      description: '牛タンです。1本約800g〜。焼肉、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 600,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-kalbi-us-au',
      name: '牛 カルビー (US/AU)',
      description: '牛カルビー（US/AU産）です。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-kalbi-premium',
      name: '牛 カルビー (上)',
      description: '上質な牛カルビーです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 280,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-kalbi-domestic',
      name: '牛 カルビー (国産)',
      description: '国産牛カルビーです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 370,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'lamb',
      name: 'ラム',
      description: 'ラムです。焼肉、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 240,
      unit: '100g',
      categories: ['yakiniku', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jingiskanFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-horumon',
      name: '牛ホルモン',
      description: '牛ホルモンです。焼肉、鍋、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 180,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${nabeUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-horumon',
      name: '豚ホルモン',
      description: '豚ホルモンです。焼肉、鍋、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 180,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${nabeUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-sagari',
      name: '豚サガリ',
      description: '豚サガリです。1パック300gです。',
      priceType: 'PACK' as const,
      basePrice: 550,
      unit: '1p (300g)',
      categories: ['yakiniku'],
      usageOptionIds: '',
      flavorOptionIds: `${shioFlavor?.id}`,
      quantityMethods: 'PACK',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'tontoro',
      name: 'トントロ',
      description: 'トントロです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 180,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-bara-yakiniku',
      name: '豚バラ',
      description: '豚バラです。焼肉、豚肉、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 160,
      unit: '100g',
      categories: ['yakiniku', 'pork', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-tan',
      name: '豚タン',
      description: '豚タンです。1本約250g〜。焼肉、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 180,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-gatsu',
      name: '豚ガツ',
      description: '豚ガツです。焼肉、鍋、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 150,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${nabeUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-spare-ribs',
      name: '豚スペアリブ',
      description: '豚スペアリブです。1パック500g。焼肉、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'PACK' as const,
      basePrice: 900,
      unit: '1p (500g)',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-seseri',
      name: '鶏セセリ',
      description: '鶏セセリです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-sunagimo-yakiniku',
      name: '鶏砂肝',
      description: '鶏砂肝です。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['yakiniku', 'chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'schauessen',
      name: 'シャウエッセン',
      description: 'シャウエッセンです。1本約18g。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '本',
      categories: ['yakiniku', 'processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'r-pork-wiener',
      name: 'Rポークウインナー',
      description: 'Rポークウインナーです。1本約20g。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 150,
      unit: '本',
      categories: ['yakiniku', 'processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'chicken-skin',
      name: '鶏皮',
      description: '鶏皮です。1パック200g。',
      priceType: 'PACK' as const,
      basePrice: 100,
      unit: '1p (200g)',
      categories: ['yakiniku'],
      usageOptionIds: '',
      flavorOptionIds: `${shioFlavor?.id}`,
      quantityMethods: 'PACK',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'yakitori',
      name: 'ヤキトリ',
      description: 'ヤキトリです。1パック20本入り。',
      priceType: 'PACK' as const,
      basePrice: 800,
      unit: '1p (20本)',
      categories: ['yakiniku'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PACK',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'pork-bara-kushi',
      name: '豚バラ串',
      description: '豚バラ串です。70円/本、1400円/1パック(20本)。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 70,
      unit: '本',
      categories: ['yakiniku'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT,PACK',
      hasRemarks: false,
      hasStock: true
    },
    // 豚肉カテゴリ
    {
      id: 'pork-loin',
      name: '豚ロース',
      description: '豚ロースです。豚肉、しゃ㍶しゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 170,
      unit: '100g',
      categories: ['pork', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-shoulder-loin',
      name: '豚肩ロース',
      description: '豚肩ロースです。豚肉、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 160,
      unit: '100g',
      categories: ['pork', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-fillet',
      name: '豚ヒレ',
      description: '豚ヒレです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 220,
      unit: '100g',
      categories: ['pork'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-thigh',
      name: '豚モモ',
      description: '豚モモです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 120,
      unit: '100g',
      categories: ['pork'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-shoulder',
      name: '豚肩',
      description: '豚肩です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 120,
      unit: '100g',
      categories: ['pork'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-liver',
      name: '豚レバー',
      description: '豚レバーです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 70,
      unit: '100g',
      categories: ['pork'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-bone',
      name: '豚骨',
      description: '豚骨です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 40,
      unit: '100g',
      categories: ['pork'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'pork-back-fat',
      name: '豚背脂',
      description: '豚背脂です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 50,
      unit: '100g',
      categories: ['pork'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    // 牛肉カテゴリ
    {
      id: 'beef-shoulder-loin-domestic',
      name: '牛肩ロース(国産)',
      description: '牛肩ロース(国産)です。焼肉、しゃぶしゃぶ、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 500,
      unit: '100g',
      categories: ['beef', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-shoulder-domestic',
      name: '牛肩(国産)',
      description: '牛肩(国産)です。焼肉、しゃぶしゃぶ、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 400,
      unit: '100g',
      categories: ['beef', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-bara-domestic',
      name: '牛バラ(国産)',
      description: '牛バラ(国産)です。焼肉、しゃぶしゃぶ、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 380,
      unit: '100g',
      categories: ['beef', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-shoulder-loin-us-au',
      name: '牛肩ロース(US/AU)',
      description: '牛肩ロース(US/AU)です。焼肉、しゃぶしゃぶ、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 280,
      unit: '100g',
      categories: ['beef', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-bara-us-au',
      name: '牛バラ(US/AU)',
      description: '牛バラ(US/AU)です。焼肉、しゃぶしゃぶ、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['beef', 'shabu'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-thigh-us-au',
      name: '牛モモ(US/AU)',
      description: '牛モモ(US/AU)です。焼肉、しゃぶしゃぶ、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 270,
      unit: '100g',
      categories: ['beef'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-suji',
      name: '牛スジ',
      description: '牛スジです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['beef'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    // 鶏肉カテゴリ
    {
      id: 'chicken-thigh',
      name: '鶏モモ',
      description: '鶏モモです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 120,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-breast',
      name: '鶏ムネ',
      description: '鶏ムネです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-sasami',
      name: '鶏ササミ',
      description: '鶏ササミです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-wing-tip',
      name: '手羽先',
      description: '手羽先です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-wing-root',
      name: '手羽元',
      description: '手羽元です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-wing-mid',
      name: '手羽中',
      description: '手羽中です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 120,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-carcass',
      name: '鶏ガラ',
      description: '鶏ガラです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 40,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'chicken-sunagimo-chicken',
      name: '鶏砂肝',
      description: '鶏砂肝です。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['yakiniku', 'chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    // 十勝彩美牛カテゴリ
    {
      id: 'saibi-sirloin',
      name: '彩美牛サーロイン',
      description: '彩美牛サーロインです。焼肉、ステーキ、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 800,
      unit: '100g',
      categories: ['tokachi-saibi'],
      usageOptionIds: `${yakinikuUsage?.id},${steakUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'saibi-shoulder-loin',
      name: '彩美牛肩ロース',
      description: '彩美牛肩ロースです。焼肉、ステーキ、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 730,
      unit: '100g',
      categories: ['tokachi-saibi'],
      usageOptionIds: `${yakinikuUsage?.id},${steakUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'saibi-thigh',
      name: '彩美牛モモ',
      description: '彩美牛モモです。焼肉、ステーキ、しゃぶしゃぶ、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 480,
      unit: '100g',
      categories: ['tokachi-saibi'],
      usageOptionIds: `${yakinikuUsage?.id},${steakUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'saibi-bara',
      name: '彩美牛バラ',
      description: '彩美牛バラです。焼肉、すき焼き、その他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 450,
      unit: '100g',
      categories: ['tokachi-saibi'],
      usageOptionIds: `${yakinikuUsage?.id},${sukiyakiUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT,PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'saibi-kalbi',
      name: '彩美牛カルビー',
      description: '彩美牛カルビーです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 450,
      unit: '100g',
      categories: ['tokachi-saibi'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'saibi-special-kalbi',
      name: '彩美牛特選カルビー',
      description: '彩美牛特選カルビーです。焼肉やその他の用途に最適です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 750,
      unit: '100g',
      categories: ['tokachi-saibi'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'WEIGHT',
      hasRemarks: true,
      hasStock: true
    },
    // 挽肉カテゴリ
    {
      id: 'ground-pork',
      name: '豚挽肉',
      description: '豚挽肉です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 110,
      unit: '100g',
      categories: ['ground-meat'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'ground-beef',
      name: '牛挽肉',
      description: '牛挽肉です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 180,
      unit: '100g',
      categories: ['ground-meat'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'ground-chicken',
      name: '鶏挽肉',
      description: '鶏挽肉です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['ground-meat'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'ground-beef-pork',
      name: '牛豚合挽肉',
      description: '牛豚合挽肉です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 150,
      unit: '100g',
      categories: ['ground-meat'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    // 加工品カテゴリ
    {
      id: 'loin-ham',
      name: 'ロースハム',
      description: 'ロースハムです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'bara-bacon',
      name: 'バラベーコン',
      description: 'バラベーコンです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'skinless-wiener',
      name: '皮ナシウイニー',
      description: '皮ナシウイニーです。1本約8g。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'schauessen-processed',
      name: 'シャウエッセン',
      description: 'シャウエッセンです。1本約18g。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '本',
      categories: ['yakiniku', 'processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: false,
      hasStock: true
    },
  ]

  // 各商品を作成
  for (const productData of products) {
    // 商品を作成（categoriesフィールドを除く）
    const { categories, ...productDataWithoutCategories } = productData
    const product = await prisma.product.upsert({
      where: { id: productData.id },
      update: {},
      create: productDataWithoutCategories
    })
    
    // カテゴリとの関係を作成
    if (categories) {
      for (const categorySlug of categories) {
        const category = createdCategories[categorySlug]
        if (category) {
          await prisma.productCategory.upsert({
            where: {
              productId_categoryId: {
                productId: product.id,
                categoryId: category.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              categoryId: category.id
            }
          })
        }
      }
    }
    
    console.log('Product created:', productData.name, 'with categories:', categories || 'none')
  }

  console.log('All products created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
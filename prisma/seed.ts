import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 管理者ユーザーを作成
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
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

  const createdCategories: Record<string, { id: string; name: string; slug: string; sortOrder: number; createdAt: Date; updatedAt: Date }> = {}
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
      description: '当店の圧倒的一番人気！非常に柔らかくジューシーな味わいをぜひ当店ならではの厚切りカットで！牛一頭からわずかしか取れない希少部位のサガリ。肉質が非常に柔らかいのでお子様からご年配の方まで大人気です。実は内臓に分類されるサガリ、中火でじっくりと火を通して頂くのがおすすめです！',
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
      description: '焼肉屋等でも大人気の牛タン！牛タン特有の香り、柔らかくジューシーな味わいは牛タンならでは。牛タン好きにはたまらない、自分のお好みの厚さにスライスできるのも当店の大人気サービス。ネギやレモンを添えればそこはもう焼肉屋さん。さっぱりしゃぶしゃぶも人気です！特別な日のお家で、みんなとワイワイBBQで、ぜひご賞味あれ。※当店は一本売りとなっております。（約800g～1kg）厚め、極厚、ステーキに関しましては、厚く切って美味しく頂けるタン元、タン中の中間までを厚めに、それより先のタン中、タン先は3㎜でお切りいたします。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 600,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'beef-kalbi-us-au',
      name: '牛 カルビー (US/AU)',
      description: 'いっぱい食べる方に大人気！コスパ抜群のUS/AU産の牛カルビーになります。しっかりした肉質にジューシーな脂が特徴の牛バラ肉を使用しております。タレを絡ませて食べると白米が止まらないそんな商品です。焼肉はもちろん、カルビー丼や、炒め物など幅広く活躍してくれること間違いなし！',
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
      description: '赤身の旨みとほどよいサシが最高！柔らかさと食べ応えを両立させたコスパ抜群の一品。旨みたっぷりのUS/AU産牛肩ロース部位を使用しております。タレをつけて召し上がるのはもちろん、お持ちのスパイスなどにも非常に相性がいいお肉となっております。',
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
      description: '当店の一押しカルビー！食べたらわかる、柔らかく旨みの強い肉質に細かいサシが口の中で溶けていく。知る人ぞ知るコスパ最強の国産牛を使ったカルビーとなります。是非ご賞味ください。',
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
      description: '夏はBBQ、冬はしゃぶしゃぶ！オールシーズン ジンギスカン！そんな1年中大活躍のラム肉です。柔らかく、いい意味でクセが少ないラムの香りが鼻に抜けていきます。当店オリジナルのジンギスカン用漬けタレももちろんおすすめですが、ハーブやスパイスなどとも相性抜群となっております。本場ニュージーランド/オーストラリア産のラムショルダーを使用しております。※当店は生ラムを仕入れておりますが、一度鮮度保持のため超低温冷凍庫にて冷凍いたしておりますので、生ラムではございません。ご注意ください。',
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
      description: 'プリプリの旨甘い脂が脳天に刺さる。夏はBBQに秋冬はもつ鍋等に意外と料理の幅が広い一品です。焼肉、BBQの際は大変火が上がりますので目を離さないようにお願いいたします。野菜と一緒にもつ焼きなんかも非常におすすめです！特注ホルモンタレや塩タレでぜひご賞味ください。',
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
      description: '当店人気ナンバー2！噛めば噛むほど旨みが広がる！みんな大好き、王道の豚ホルモンです。お子様から大人まで幅広い層に支持されております。BBQ、鍋、炒め物、お酒のつまみまで。いろんな料理に使用できちゃいます。※豚の直腸のみを使用しております',
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
      description: '隠れた名脇役、当店ナンバー3！実はファンの多い豚サガリです。塩タレで漬け込んでおりますので、すぐ焼いて食べれる品物になっております。心地よい歯ごたえ、噛めば噛むほど旨みがでてくる。焼肉のメインにも、お酒のつまみにもぴったりです。※塩タレ付1P 300g入りになっております。',
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
      description: '脂の甘みと歯ごたえがクセになる！焼肉屋さんでの人気商品。豚の首から頬にかけてのお肉で一頭からごくわずかしか取れない希少部位になります。塩だれとの相性が非常によく、レモンなんかがあるとさらに脂の旨みが引き立つのでおすすめです！',
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
      description: 'ジューシーで旨み抜群！焼いて良し、炒めて良し、煮て良し。万能すぎる豚バラ肉です。スライスは炒め物や鍋用にブロックは角煮やチャーシュー、煮込み料理にも！',
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
      description: '程よい弾力とタンの旨みがクセになる！お手軽で旨みたっぷりの豚タンです。独特なコリコリ感とタン特有の香りを楽しめます。焼くだけ、炒めるだけでご飯もお酒も進む一品ができちゃいます。当店の自家製タレや塩タレとの相性はもちろんレモンやニンニクとも相性抜群ですのでぜひ！※1本売り（約250g）となっております',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 180,
      unit: '100g',
      categories: ['yakiniku'],
      usageOptionIds: `${yakinikuUsage?.id},${shabuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'pork-gatsu',
      name: '豚ガツ',
      description: 'コリコリ食感がたまらない！食感のとりこになる方も多い。クセが少なく脂も控えめ。モツ好きにはたまらない一品！焼き、炒め、煮込みなどなんでも行けちゃう優秀なホルモン！',
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
      description: '骨付きで豪快に！骨周りの肉の旨み、ジューシーな食感が人気の豚スペアリブです。調理映え、写真映えする見た目も人気の要因のひとつではないでしょうか！BBQで豪快にかぶりつくのもいいですがスパイスなどと煮込んでホロホロのスペアリブも非常に美味です！あばら骨がついた部位を使用しております。※1p約500gです',
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
      description: 'セセリならではの食感！鶏の首のまわりの筋肉で1羽からわずかしか取れない希少部位。よく動かす部位なので、ほどよい弾力と濃厚な旨みがギュッと詰まっています。塩タレとの相性が非常によく、お好みで柚子胡椒や刻んだネギを散らしても非常においしいです！',
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
      description: 'コリコリシャキシャキ！ヘルシーで高タンパク質な砂肝。独特なあの食感がくせになってしまう。焼くだけ炒めるだけで旨みがすごくある部位なのでシンプルな味付けでも大丈夫！にんにくや柚子胡椒などとの相性が抜群です。※焼き肉用カットは焼き上がりがきれいに見えるように格子状に切れ込みが入っております',
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
      description: 'パリッとジューシー！一番の特長は、“天然羊腸”を使用した「パリッとした皮」の食感。噛んだ瞬間に肉汁がジュワッと広がり、まるで専門店のような味わいが家庭で楽しめます。上質な粗びき肉を使用し、スモークで旨みを凝縮。朝食からお弁当、おつまみ、BBQまで幅広く使える万能ウインナーです。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 40,
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
      description: '食べ応えとコスパがすごい！バリっとした食感にあふれる肉汁。フランクをぎゅっとしたような味わいで焼き肉用にはもちろん、ミニホットドッグなんかにも使用できそうな一品になっております。ぜひご賞味あれ！',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 30,
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
      description: '隠れた人気商品！旨みと脂のコクが強い。食感もパリパリにも柔らかくもできるので料理の幅は幅い。塩ダレとの相性抜群でBBQはもちろん焼きそばや餅子、揚げても茹でても楽しめます。※BBQ用お肉3,000円以上ご購入で1pサービスいたします',
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
      description: 'BBQの定番！小さなお子様から大人まで大人気。串付きなので焼きやすく手が汚れにくいのも良い。豚バラの旨みがお手軽に楽しめる一品。※冷凍品になります',
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
      description: 'BBQの定番！小さなお子様から大人まで大人気。串付きなので焼きやすく手が汚れにくいのも良い。豚バラの旨みがお手軽に楽しめる一品。※冷凍品になります',
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
      description: '「柔らかい肉質と程よい脂身が特徴」こんな料理に→ トンカツ、生姜焼き、しゃぶしゃぶ、豚丼、ポークソテー、カツ丼、冷しゃぶサラダetc…',
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
      description: '「食べ応えのある肉質と程よい脂身」こんな料理に→焼肉、しゃぶしゃぶ、炒め物、カレー、シチュー、肉じゃが、串焼き、豚汁、甘辛煮etc…',
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
      description: '「柔らかさは豚肉の中で一番。上品な赤身」こんな料理に→ ヒレカツ、ステーキ、ピカタ、洋風ソース煮、ポトフ、デミグラス煮込み、肉巻etc…',
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
      description: '「柔らかい赤身が特徴の万能肉」▶︎ 冷しゃぶ、酢豚、唐揚げ、筑前煮、炒飯、八宝菜、ソテー、ハム、肉団子',
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
      description: '「赤身が多く煮込み等におすすめ」▶︎ 煮込み料理、角煮、カレー、シチュー、ミンチ料理、肉団子、炒め物',
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
      description: '「鉄分豊富で栄養満点。」▶︎ レバニラ炒め、レバカツ、甘辛煮、唐揚げ、スタミナ炒め',
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
      description: '「旨みの素。じっくり煮出して極上スープに」▶︎ 豚骨ラーメン、ポトフ、スープカレー、鍋の出汁',
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
      description: '「コクと香りを加える隠し味」▶︎ ラーメンのトッピング、チャーハン、野菜炒め、煮込み料理のコク出し',
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
      description: '「柔らかい赤身と脂が絶妙。濃厚な旨み」▶︎ すき焼き、しゃぶしゃぶ、焼肉、ステーキ、すき煮、プルコギ、煮込み',
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
      description: '「味わい濃く、煮込みに強い実力派」▶︎ ビーフカレー、シチュー、肉じゃが、すき焼き、炒め物、牛丼、煮込み料理',
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
      description: '「ジューシーで旨みたっぷり。上品で食べ応えも抜群」▶︎ 焼肉（カルビ）、牛丼、煮込み、プルコギ、肉巻き、ビーフシチュー',
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
      description: '「食べ応えのある肉質の赤身と程よい脂がベストマッチ」▶︎ すき焼き、しゃぶしゃぶ、焼肉、ステーキ、すき煮、プルコギ、煮込み',
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
      description: '「ジューシーで旨みたっぷり。お子様にも大人気」▶︎ 焼肉（カルビ）、牛丼、煮込み、プルコギ、肉巻き、ビーフシチュー',
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
      description: '「あっさり赤身で使いやすい万能部位」▶︎ ローストビーフ、ステーキ、焼肉、牛丼、すき焼き、しゃぶしゃぶ、炒め物、寿司のネタ',
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
      description: '「コラーゲンたっぷり。煮込むほどとろける旨み」▶︎ 牛スジ煮込み、どて煮、おでん、カレー、シチュー、スープ',
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
      description: '「ジューシーで鶏の旨みがガツンと来る」▶︎ 唐揚げ、焼き鳥、照り焼き、親子丼、チキンステーキ、カレー、鍋料理',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 120,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-breast',
      name: '鶏ムネ',
      description: '「ヘルシーであっさり鶏の旨みを感じられる」▶︎ 唐揚げ、チキンカツ、蒸し鶏、鶏ハム、サラダ、親子丼、チキン南蛮、スープ',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'PIECE',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-sasami',
      name: '鶏ササミ',
      description: '「やわらかく淡白。低脂質＆高たんぱくでいろんな料理に」▶︎ サラダ、和え物、天ぷら、チーズ巻き、棒棒鶏、ナゲット',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: `${yakinikuUsage?.id},${otherUsage?.id}`,
      flavorOptionIds: `${jishaSpecialFlavor?.id},${shioFlavor?.id},${horumonFlavor?.id},${shiokoshoFlavor?.id},${nashiFlavor?.id}`,
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-wing-tip',
      name: '手羽先',
      description: '「皮パリ＆ジューシーの定番」▶︎ 甘辛ダレ焼き、唐揚げ、手羽先餅子、スープ、煮込み',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-wing-root',
      name: '手羽元',
      description: '「食べやすいサイズで子どもにも人気」▶︎ 唐揚げ、甘辛揚げ、照り焼き、チューリップ唐揚げ、お弁当のおかず',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 100,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-wing-mid',
      name: '手羽中',
      description: '「骨付きで旨みたっぷり。煮込みに最適」▶︎ 煮込み料理、カレー、シチュー、鍋、スープ、グリル',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 120,
      unit: '100g',
      categories: ['chicken'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'PIECE_COUNT',
      hasRemarks: true,
      hasStock: true
    },
    {
      id: 'chicken-carcass',
      name: '鶏ガラ',
      description: '「出汁の王様。旨みのベースに」▶︎ 鶏ガラスープ、ラーメンスープ、鍋、雑炊',
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
    // 十勝彩美牛カテゴリ
    {
      id: 'saibi-sirloin',
      name: '彩美牛サーロイン',
      description: '牛肉の最高峰と称されるサーロイン。濃厚で柔らかい赤身の旨みと口の中で溶け出す脂の甘みが特徴です。▶︎ ステーキ、焼き肉、ロースト、すき焼き、しゃぶしゃぶ、ビーフカツ【彩美牛について】黒毛和種を父にもつ、北海道十勝の自然豊かな環境でのびのびとストレスなく育った北海道産牛、それが十勝彩美牛。徹底した飼育管理と、品質管理によるきめ細やかな肉質と、まろやかな旨みが特徴です。',
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
      description: '肩ロースは赤身の力強い味わいと、ほどよく混ざる脂の甘みが魅力。すき焼きやしゃぶしゃぶにすれば、肉の旨みが食材に溶け込み、格別の味わいに。厚めに切ればローストビーフやステーキにも最適で、しっとり柔らかく仕上がります。▶︎ すき焼き、しゃぶしゃぶ、焼肉、ローストビーフ、ステーキ、鉄板焼き【彩美牛について】黒毛和種を父にもつ、北海道十勝の自然豊かな環境でのびのびとストレスなく育った北海道産牛、それが十勝彩美牛。徹底した飼育管理と、品質管理によるきめ細やかな肉質と、まろやかな旨みが特徴です。',
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
      description: 'モモは余分な脂が少なく、噛むほどに広がる濃厚な赤身の味わいが特徴。低脂肪でヘルシーながらも、しっとり柔らかな肉質が楽しめます。ローストビーフやステーキに最適。▶︎ 焼肉、ステーキ、ローストビーフ、牛たたき、しゃぶしゃぶ、鉄板焼き【彩美牛について】黒毛和種を父にもつ、北海道十勝の自然豊かな環境でのびのびとストレスなく育った北海道産牛、それが十勝彩美牛。徹底した飼育管理と、品質管理によるきめ細やかな肉質と、まろやかな旨みが特徴です。',
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
      description: 'バラは、赤身と脂身が美しく重なり合った部位。とろけるような脂の甘みと、赤身のコクが一体となり、濃厚で奥行きのある味わいを生み出します。▶︎ 焼肉、すき焼き、牛丼、煮込み、カレー、角煮、プルコギ、ビビンバ【彩美牛について】黒毛和種を父にもつ、北海道十勝の自然豊かな環境でのびのびとストレスなく育った北海道産牛、それが十勝彩美牛。徹底した飼育管理と、品質管理によるきめ細やかな肉質と、まろやかな旨みが特徴です。',
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
      description: '口に入れた瞬間、脂の甘みがじゅわっと広がり、赤身の旨みと溶け合う極上の味わい。彩美牛ならではのきめ細やかな肉質は、脂がしつこくなく上品で非常に人気です。▶︎ 焼肉、炒め物、牛丼【彩美牛について】黒毛和種を父にもつ、北海道十勝の自然豊かな環境でのびのびとストレスなく育った北海道産牛、それが十勝彩美牛。徹底した飼育管理と、品質管理によるきめ細やかな肉質と、まろやかな旨みが特徴です。',
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
      description: '一頭の中でも限られた部位から厳選。脂の甘みと濃厚な旨みがとろけるように広がり、特別な日の食卓を華やかに彩る。「ワンランク上の贅沢」をお届けします。▶︎ 焼肉、すき焼き、網焼き、鉄板焼き【彩美牛について】黒毛和種を父にもつ、北海道十勝の自然豊かな環境でのびのびとストレスなく育った北海道産牛、それが十勝彩美牛。徹底した飼育管理と、品質管理によるきめ細やかな肉質と、まろやかな旨みが特徴です。',
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
      description: '甘みとコクが料理を引き立てる。加熱してもやわらかく仕上がり、扱いやすいのが特徴。ハンバーグ、餅子、シュウマイ、麻婆豆腐、野菜炒め、肉味噮などにおすすめ。',
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
      description: 'しっかりした旨みとコク。加えるだけで料理全体の味に深みが出ます。ドライカレー、タコライス、牛そぼろ、炒め物などに',
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
      description: '軽やかでやさしい味わい。脂肪分が少なくヘルシーで、離乳食から高齢の方まで幅広く使えます。鶏そぼろ、つくね、鶏団子スープ、ヘルシーハンバーグなどに最適です。',
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
      description: '牛のコク×豚のやわらかさハンバーグ、メンチカツ、ロールキャベツなど、食卓の定番に大活躍。ジューシーでバランスの良い味わいが人気。',
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
      description: 'やわらかく食べやすいロースハム。サラダやサンドイッチ、冷やし中華などにおすすめです。（スライスのみです）',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'bara-bacon',
      name: 'バラベーコン',
      description: '風味豊かなバラベーコン。ブロックからスライスまで対応しておりますので、様々な料理に合わせることができます。卵料理やスープ、パスタ、炒め物、スモーク用など幅広く使えます。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
      hasRemarks: false,
      hasStock: true
    },
    {
      id: 'skinless-wiener',
      name: '皮ナシウイニー',
      description: '皮がないので小さなお子様でも食べやすいウインナー。お弁当やおやつ、軽食に便利な一品です。',
      priceType: 'WEIGHT_BASED' as const,
      basePrice: 200,
      unit: '100g',
      categories: ['processed-foods'],
      usageOptionIds: '',
      flavorOptionIds: '',
      quantityMethods: 'WEIGHT',
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
      update: productDataWithoutCategories,
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
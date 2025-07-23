# 精肉店注文サイト（ブッチャー丸幸）- MVP実装指示書

## プロジェクト概要
店舗受け取り型の精肉店注文サイトを開発する。既存ホームページ（https://butcher-maruko.com/）のデザインに寄せたシンプルで使いやすいサイトを構築する。

## 技術スタック

### フロントエンド
- **Next.js 15+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form** (フォーム管理)
- **Zod** (バリデーション)

### バックエンド・データベース
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth.js** (管理者認証)

### ホスティング
- **Netlify** (フロントエンド)
- **Neon** (PostgreSQLデータベース)

## 実装時の重要な注意点

### Next.js App Router ベストプラクティス
1. **サーバーコンポーネントを優先使用**
   - データベースアクセスはサーバーコンポーネントで実行
   - `use client` は必要最小限（フォーム、状態管理、イベントハンドラ）
   - SEOと初期ロード速度の向上

2. **コンポーネント設計**
   - 再利用可能な小さなコンポーネントに分割
   - `components/ui/` - 基本UIコンポーネント
   - `components/features/` - 機能別コンポーネント
   - `app/` - ページレベルコンポーネント

3. **データ取得パターン**
   - サーバーアクションでデータ変更
   - `loading.tsx`、`error.tsx` でUX向上
   - Streaming UI の活用

### パフォーマンス最適化
- **画像最適化**: Next.js Image コンポーネント使用
- **フォント最適化**: `next/font` で日本語フォント最適化
- **バンドル最適化**: 動的インポート活用
- **キャッシュ戦略**: Prisma クエリ結果の適切なキャッシング

## ビジネス要件

### 営業時間・受け取り制限
- **営業時間**: 月〜金 9:00-16:30、土 8:00-12:00、日祝 定休日
- **受け取り不可時間**: 平日 11:00-13:00
- **注文締切**: 受け取り希望時間の2時間前まで
- **支払い**: 店舗での現金払いのみ

### 商品カテゴリ（8つ）
1. 焼肉
2. すき焼き・しゃぶしゃぶ
3. 十勝彩美牛
4. 牛肉
5. 豚肉
6. 鶏肉
7. 挽肉
8. 加工食品

### 商品タイプ
- **重量単価商品**: 100g単位での価格表示、顧客がグラム数指定
- **パック売り商品**: 固定価格での販売

## データベース設計

### Prismaスキーマ設計
```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  sortOrder Int       @default(0)
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]
}

model Product {
  id              String      @id @default(cuid())
  name            String
  description     String?
  priceType       PriceType   // WEIGHT_BASED, PACK
  basePrice       Int         // 重量単価商品は100g単位の価格、パック商品は固定価格
  unit            String      // "100g" または "パック"
  imageUrl        String?
  isActive        Boolean     @default(true)
  stock           Int?        // 在庫数（パック商品用）
  // 商品オプション設定
  hasUsageOption  Boolean     @default(false)  // 用途選択の有無
  usageOptions    Json?       // ["焼肉用", "煮込み用", "カレー用"] などの配列
  hasFlavorOption Boolean     @default(false)  // 味付け選択の有無
  flavorOptions   Json?       // ["塩味", "醤油味", "味噌味"] などの配列
  quantityMethod  QuantityMethod @default(WEIGHT) // 数量・個数指定方法
  hasRemarks      Boolean     @default(false)  // 備考欄の有無
  categoryId      String
  category        Category    @relation(fields: [categoryId], references: [id])
  orderItems      OrderItem[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique
  customerName  String
  customerPhone String
  pickupDate    DateTime
  pickupTime    String
  totalAmount   Int
  status        OrderStatus   @default(PENDING)
  orderItems    OrderItem[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model OrderItem {
  id               String  @id @default(cuid())
  quantity         Int     // 重量商品はグラム数、パック商品は個数
  price            Int     // 商品単価
  subtotal         Int     // 小計
  // 選択されたオプション
  selectedUsage    String? // 選択された用途
  selectedFlavor   String? // 選択された味付け
  remarks          String? // 備考
  orderId          String
  order            Order   @relation(fields: [orderId], references: [id])
  productId        String
  product          Product @relation(fields: [productId], references: [id])
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  role     Role   @default(ADMIN)
}

enum PriceType {
  WEIGHT_BASED  // 重量単価
  PACK          // パック売り
}

enum QuantityMethod {
  WEIGHT        // 重量指定（g単位）
  PIECE         // 枚数指定
  PACK          // パック指定
  PIECE_COUNT   // 本数指定
}

enum OrderStatus {
  PENDING     // 注文受付
  PREPARING   // 準備中
  READY       // 準備完了
  COMPLETED   // 受け取り完了
  CANCELLED   // キャンセル
}

enum Role {
  ADMIN
}
```

## 機能要件

### 顧客向け機能

#### 1. 商品閲覧機能
- カテゴリ別商品一覧表示
- 商品詳細表示（価格、説明、在庫状況）
- 重量単価/パック売りの区別表示
- 商品画像（後から挿入予定）

#### 2. 注文機能
- カート機能（セッションストレージ使用、localStorage使用不可）
- 重量指定（重量単価商品）・数量指定（パック商品）
- **商品オプション選択**:
  - 用途選択（商品により表示/非表示）
  - 味付け選択（商品により表示/非表示）
  - 数量・個数指定方法（商品により異なる方式）
  - 備考欄（商品により表示/非表示）
- 受け取り日時指定（営業時間・制限時間考慮）
- 顧客情報入力（名前・電話番号）

#### 3. 注文完了機能
- 注文確認画面
- 注文番号生成・表示
- 注文完了通知

### 管理画面機能

#### 1. 認証機能
- NextAuth.js使用
- 管理者ログイン・ログアウト

#### 2. 注文管理機能
- 注文一覧表示（日付・ステータス別フィルタ）
- 注文詳細確認
- 注文ステータス更新
- 受け取り時間別ソート

#### 3. 商品管理機能
- 商品一覧・編集
- 在庫数更新
- 商品の表示・非表示切り替え
- **商品オプション設定**:
  - 用途オプションの追加・編集・削除
  - 味付けオプションの追加・編集・削除
  - 数量指定方法の設定
  - 備考欄の有効/無効設定
- カテゴリ管理

## デザイン要件

### デザイン方針
- **既存サイト準拠**: https://butcher-maruko.com/ のデザインに寄せる
- **シンプル・ミニマル**: 余計な装飾を避け、情報の視認性重視
- **アクセシビリティ**: 高齢者にも使いやすいUI（大きめボタン、明確なナビゲーション）

### UIコンポーネント設計
```
components/
├── ui/
│   ├── Button.tsx        # 基本ボタン
│   ├── Card.tsx          # カードコンポーネント
│   ├── Input.tsx         # 入力フィールド
│   ├── Select.tsx        # セレクトボックス
│   ├── Textarea.tsx      # テキストエリア
│   ├── Modal.tsx         # モーダル
│   └── Calendar.tsx      # カレンダー表示
├── features/
│   ├── ProductCard.tsx   # 商品カード
│   ├── ProductOptions.tsx # 商品オプション選択
│   ├── QuantitySelector.tsx # 数量選択（商品タイプ別）
│   ├── CartItem.tsx      # カートアイテム
│   ├── OrderSummary.tsx  # 注文サマリー
│   └── PickupTimeSelect.tsx # 受け取り時間選択
└── layout/
    ├── Header.tsx        # ヘッダー
    ├── Footer.tsx        # フッター
    └── Navigation.tsx    # ナビゲーション
```

### レスポンシブ対応
- **モバイルファースト**: 小さな画面での操作性優先
- **ブレークポイント**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **タッチ操作対応**: ボタンサイズ44px以上

## ページ構成

```
app/
├── page.tsx                    # トップページ（カテゴリ一覧）
├── categories/
│   └── [slug]/
│       └── page.tsx           # カテゴリ別商品一覧
├── products/
│   └── [id]/
│       └── page.tsx           # 商品詳細
├── cart/
│   └── page.tsx               # カート
├── checkout/
│   ├── page.tsx               # 注文情報入力
│   └── confirmation/
│       └── page.tsx           # 注文確認
├── order-complete/
│   └── page.tsx               # 注文完了
└── admin/
    ├── login/
    │   └── page.tsx           # 管理者ログイン
    ├── dashboard/
    │   └── page.tsx           # ダッシュボード
    ├── orders/
    │   ├── page.tsx           # 注文一覧
    │   └── [id]/
    │       └── page.tsx       # 注文詳細
    └── products/
        ├── page.tsx           # 商品管理一覧
        └── [id]/
            └── page.tsx       # 商品編集
```

## 実装ガイドライン

### 1. 型安全性の確保
- Zodスキーマでバリデーション実装
- Prismaの型定義活用
- TypeScriptの厳密設定

### 2. エラーハンドリング
- `error.tsx`で統一されたエラー画面
- フォームエラーの適切な表示
- 通信エラー時の再試行機能

### 3. SEO対策
- メタデータ適切な設定
- 構造化データの実装
- ページタイトル・ディスクリプション最適化

### 4. セキュリティ
- CSRFトークン実装
- SQLインジェクション対策（Prisma使用で自動対応）
- 管理画面のアクセス制限

### 5. テスト戦略
- 単体テスト: Jest + React Testing Library
- E2Eテスト: Playwright（主要な注文フロー）

## 開発手順

### Phase 1: 環境構築・基盤
1. 環境構築
2. Prisma設定・マイグレーション
3. 基本UIコンポーネント実装
4. 認証機能実装

### Phase 2: 顧客向け機能
1. 商品表示機能
2. カート機能
3. 注文機能
4. 受け取り時間選択機能

### Phase 3: 管理機能
1. 注文管理画面
2. 商品管理画面
3. ダッシュボード

### Phase 4: 最適化・デプロイ
1. Netlify向け最適化（Static Export設定）
2. Neon接続設定・環境変数設定
3. E2Eテスト実装
4. 本番デプロイ・動作確認

## デプロイメント設定

### Netlify設定
- **ビルドコマンド**: `npm run build`
- **パブリッシュディレクトリ**: `out` (Static Export使用時)
- **Node.js バージョン**: 18以上
- **環境変数**: 
  - `DATABASE_URL` (Neonの接続URL)
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`

### Neon PostgreSQL設定
- **データベースプール**: Prisma Connection Pooling使用
- **SSL接続**: 本番環境では必須
- **バックアップ**: Neonの自動バックアップ機能活用

### 環境変数設定例
```env
# Database
DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-site.netlify.app"

# Optional: Prisma
PRISMA_GENERATE_DATAPROXY="true"
```

### Netlifyデプロイメント注意事項
- **Static Export**: Next.js を静的サイトとしてエクスポート
- **API Routes制限**: NetlifyはEdge Functionsまたは Serverless Functions使用
- **ISR制限**: 増分静的再生成は使用不可
- **代替案**: データ更新時はサイト再ビルド、またはNetlify Functionsでサーバーサイド処理

### ブラウザストレージ制限
- **localStorage使用禁止**: Claude環境では動作しない
- **セッションストレージ使用**: カート情報の一時保存
- **Cookie使用**: 認証情報の保存

### 商品オプション機能の実装ガイド

#### オプション設定の柔軟性
```typescript
// 商品オプションの型定義例
interface ProductOptions {
  hasUsageOption: boolean;
  usageOptions: string[]; // ["焼肉用", "煮込み用", "カレー用"]
  hasFlavorOption: boolean;
  flavorOptions: string[]; // ["塩味", "醤油味", "味噌味", "プレーン"]
  quantityMethod: 'STANDARD' | 'WEIGHT_RANGE' | 'PIECE_COUNT' | 'SERVING_SIZE';
  hasRemarks: boolean;
}

// 数量指定方法の例
// WEIGHT: 重量指定（100g, 300g, 500g など）
// PIECE: 枚数指定（5枚、10枚、15枚 など）
// PACK: パック指定（1パック、2パック など）
// PIECE_COUNT: 本数指定（1本、2本、3本 など）
```

#### フロントエンド実装のポイント
- **動的オプション表示**: 商品データに基づいてオプションの表示/非表示を制御
- **バリデーション**: 必須オプションの選択チェック
- **UX配慮**: オプションが多い場合の見やすい表示方法
- **カート連携**: 選択されたオプションをカート情報に含める

#### 商品例とオプション設定
```
例1: 牛バラ肉（焼肉用）
- 用途: ["焼肉用", "すき焼き用", "煮込み用"]
- 味付け: ["プレーン", "タレ漬け"]
- 数量方法: WEIGHT (重量指定)
- 備考欄: あり

例2: 豚ロース（とんかつ用）
- 用途: ["とんかつ用", "生姜焼き用", "ソテー用"]
- 味付け: ["プレーン", "味噌漬け"]
- 数量方法: PIECE (枚数指定)
- 備考欄: あり

例3: ウインナー
- 用途: なし
- 味付け: ["プレーン", "ガーリック", "チーズ入り"]
- 数量方法: PIECE_COUNT (本数指定)
- 備考欄: なし

例4: ひき肉（合挽き）
- 用途: ["ハンバーグ用", "餃子用", "ミートソース用"]
- 味付け: なし
- 数量方法: PACK (パック指定)
- 備考欄: あり
```
- **営業時間表示**: 日本語での分かりやすい表記
- **価格表示**: 税込み価格での統一
- **電話番号形式**: ハイフンありの日本形式

### パフォーマンス考慮
- **画像遅延読み込み**: 商品一覧での重要度
- **データベース最適化**: インデックス適切な設定
- **キャッシュ戦略**: 静的データの効率的なキャッシング

この仕様書に基づいて、段階的にMVPを実装してください。まずはPhase 1から始めて、動作確認しながら順次機能を追加していくことを推奨します。
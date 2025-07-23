# ブッチャー丸幸 注文システム

新鮮で高品質な精肉をご提供するブッチャー丸幸の店舗受け取り専用注文サイトです。

## 🚀 機能

### 顧客向け機能
- **商品閲覧**: カテゴリ別・全商品一覧表示
- **商品詳細**: 価格、オプション選択（用途・味付け）
- **カート管理**: 商品追加・削除・数量変更
- **注文システム**: 顧客情報入力・受け取り時間選択
- **レスポンシブUI**: スマホ・タブレット対応

### 管理者機能
- **認証システム**: NextAuth.js による管理者ログイン
- **ダッシュボード**: 注文統計・売上確認
- **注文管理**: ステータス更新・詳細確認
- **フィルタ機能**: 日付・ステータス別検索

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS v4
- **データベース**: PostgreSQL (本番) / SQLite (開発)
- **ORM**: Prisma
- **認証**: NextAuth.js
- **バリデーション**: Zod
- **フォーム**: React Hook Form
- **デプロイ**: Netlify

## 📦 セットアップ

### 開発環境

1. **依存関係インストール**
   ```bash
   npm install
   ```

2. **環境変数設定**
   ```bash
   cp .env.example .env
   # .env ファイルを編集
   ```

3. **データベース設定**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **開発サーバー起動**
   ```bash
   npm run dev
   ```

### 本番デプロイ (Netlify + PostgreSQL)

1. **Neon PostgreSQL設定**
   - [Neon](https://neon.tech) でプロジェクト作成
   - PostgreSQL接続URLを取得

2. **Netlify デプロイ**
   - GitHubリポジトリをNetlifyに接続
   - **ビルドコマンド**: `npm run build:netlify`
   - **パブリッシュディレクトリ**: `.next`
   - 以下の環境変数を設定:
     ```
     DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
     NEXTAUTH_SECRET="your-super-secret-key-32-chars-min"
     NEXTAUTH_URL="https://your-site.netlify.app"
     NODE_ENV="production"
     ```

3. **重要な注意点**
   - 開発環境: SQLite (`prisma/schema.prisma`)
   - 本番環境: PostgreSQL (`prisma/schema.production.prisma`)
   - デプロイ時に自動でPostgreSQLスキーマに切り替わります

## 🔧 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | データベース接続URL | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth暗号化キー | `your-secret-key` |
| `NEXTAUTH_URL` | サイトURL | `https://example.com` |
| `NODE_ENV` | 実行環境 | `production` |

## 👤 デフォルトアカウント

**管理者ログイン**
- Email: `admin@butcher-maruko.com`
- Password: `admin123`

## 🏪 営業情報

**営業時間**
- 月〜金: 9:00-16:30
- 土: 8:00-12:00  
- 日祝: 定休日

**受け取り制限**
- 平日11:00-13:00は受け取り不可
- 受け取り希望時間の2時間前まで注文受付

## 📄 ライセンス

このプロジェクトはプライベートプロジェクトです。
# butcer-order-system

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
- **デプロイ**: Vercel

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

### 本番デプロイ (Vercel + Neon PostgreSQL)

#### 1. Neon PostgreSQL データベース作成

1. **Neonアカウント作成**
   - [Neon](https://neon.tech) にアクセス
   - GitHubアカウントでサインアップ

2. **新しいプロジェクト作成**
   - "Create a project" をクリック
   - プロジェクト名: `butcher-order-system`
   - PostgreSQLバージョン: 最新版を選択
   - リージョン: `Asia Pacific (Tokyo)` を推奨

3. **データベース接続情報取得**
   - プロジェクト作成後、"Connection Details" から接続URLをコピー
   - 形式: `postgresql://username:password@hostname/database?sslmode=require`

#### 2. Vercel デプロイ設定

1. **GitHubリポジトリ準備**
   ```bash
   # 変更をコミット・プッシュ
   git add .
   git commit -m "Vercelデプロイ用設定追加"
   git push origin main
   ```

2. **Vercelプロジェクト作成**
   - [Vercel](https://vercel.com) にアクセス
   - GitHubアカウントでサインイン
   - "New Project" → GitHubリポジトリを選択
   - プロジェクト名確認後、"Deploy" をクリック

3. **環境変数設定**
   - Vercel ダッシュボード → プロジェクト → Settings → Environment Variables
   - 以下の環境変数を追加:

   ```env
   DATABASE_URL
   値: postgresql://username:password@hostname/database?sslmode=require
   (Neonから取得した接続URL)

   NEXTAUTH_SECRET
   値: ランダムな32文字以上の文字列
   生成方法: openssl rand -base64 32

   NEXTAUTH_URL
   値: https://your-project-name.vercel.app
   (Vercelから自動発行されるURL)

   NODE_ENV
   値: production
   ```

4. **再デプロイ実行**
   - Environment Variables設定後
   - Deployments タブ → 最新デプロイの "..." → "Redeploy"

#### 3. データベース初期化

デプロイ完了後、データベースに初期データを投入：

```bash
# ローカルで実行（本番データベースに接続）
DATABASE_URL="your-neon-connection-url" npm run db:migrate
```

または、Vercel CLIを使用：

```bash
# Vercel CLI インストール
npm i -g vercel

# プロジェクトにリンク
vercel link

# 本番環境でコマンド実行
vercel env pull .env.production
DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2) npm run db:migrate
```

#### 4. デプロイ確認

1. **サイト動作確認**
   - Vercel URLにアクセス
   - 商品一覧が表示されることを確認

2. **管理者ログイン確認**
   - `/admin/login` にアクセス
   - デフォルトアカウントでログイン可能か確認

3. **注文機能確認**
   - 商品をカートに追加
   - 注文完了まで一通りテスト

#### 5. トラブルシューティング

**ビルドエラーが発生した場合:**
```bash
# ローカルでビルド確認
npm run build:vercel
```

**データベース接続エラーの場合:**
- Neon接続URLが正しいか確認
- データベースが起動しているか確認
- SSL接続設定が正しいか確認

**環境変数の確認:**
```bash
# Vercel CLI で環境変数確認
vercel env ls
```

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

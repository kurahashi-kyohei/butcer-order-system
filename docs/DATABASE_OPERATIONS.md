# データベース操作ガイド

このドキュメントでは、ローカル環境、テスト環境、本番環境でのデータベース操作手順をまとめています。

## 🏗️ 環境構成

### ローカル環境
- データベース: SQLite (`prisma/dev.db`)
- スキーマファイル: `prisma/schema.prisma`
- 接続: `DATABASE_URL="file:./dev.db"`

### テスト環境・本番環境
- データベース: PostgreSQL (Neon)
- スキーマファイル: `prisma/schema.production.prisma`
- 接続: `DATABASE_URL` 環境変数

## 📋 利用可能なコマンド

### package.json定義済みスクリプト
```bash
# Prismaクライアント生成
npm run db:generate

# データベーススキーマ適用
npm run db:push

# シードデータ投入
npm run db:seed

# スキーマ適用 + シードデータ投入
npm run db:migrate

# 開発サーバー起動
npm run dev

# 本番ビルド（スキーマ適用込み）
npm run build

# Vercelビルド（スキーマ適用 + シード込み）
npm run build:vercel
```

## 🔧 環境別操作手順

### ローカル開発環境

#### 初回セットアップ
```bash
# 1. 依存関係インストール
npm install

# 2. Prismaクライアント生成
npm run db:generate

# 3. データベース作成 + スキーマ適用
npm run db:push

# 4. シードデータ投入
npm run db:seed

# または、3-4を一括実行
npm run db:migrate
```

#### 日常の開発作業
```bash
# スキーマ変更後
npm run db:push

# データリセット + シード再投入
rm prisma/dev.db
npm run db:migrate

# 開発サーバー起動
npm run dev
```

### テスト環境・本番環境（PostgreSQL）

#### スキーマ適用
```bash
# 本番スキーマでクライアント生成
npx prisma generate --schema=prisma/schema.production.prisma

# 本番データベースにスキーマ適用
npx prisma db push --schema=prisma/schema.production.prisma

# シードデータ投入
npm run db:seed
```

#### 自動デプロイ（Vercel）
- Vercelへのデプロイ時は `npm run build:vercel` が自動実行される
- スキーマ適用 → シードデータ投入 → ビルドの順で実行

## 🛠️ 手動Prismaコマンド

### 基本操作
```bash
# Prismaクライアント生成
npx prisma generate

# データベーススキーマ適用（マイグレーションなし）
npx prisma db push

# データベーススキーマ確認
npx prisma db pull

# Prisma Studioでデータ確認
npx prisma studio
```

### 本番環境用（PostgreSQL）
```bash
# 本番スキーマ指定でクライアント生成
npx prisma generate --schema=prisma/schema.production.prisma

# 本番データベースにスキーマ適用
npx prisma db push --schema=prisma/schema.production.prisma

# 本番データベースでPrisma Studio起動
npx prisma studio --schema=prisma/schema.production.prisma
```

### シードデータ操作
```bash
# シードデータ投入
npx tsx prisma/seed.ts

# または npm script経由
npm run db:seed
```

## 🚨 重要な注意事項

### スキーマファイルの使い分け
- **ローカル開発**: `prisma/schema.prisma` を使用
- **本番環境**: `prisma/schema.production.prisma` を使用
- 2つのスキーマは構造が異なるため、同期が必要

### マイグレーション管理
- 現在は `prisma db push` を使用（マイグレーションファイルなし）
- 本番環境は Prisma Migrate で管理されていない状態
- 将来的にはマイグレーション管理への移行を検討

### データベース接続
- 環境変数 `DATABASE_URL` で接続先を制御
- ローカル: SQLite ファイル
- 本番: PostgreSQL接続文字列

## 🔄 環境間でのスキーマ同期

### ローカル → 本番環境への同期
1. `prisma/schema.prisma` の変更を `prisma/schema.production.prisma` に反映
2. 本番環境でスキーマ適用:
   ```bash
   npx prisma db push --schema=prisma/schema.production.prisma
   ```

### 本番環境でのベースライン作成（初回のみ）
```bash
# 既存の本番データベースをベースラインとして設定
npx prisma migrate resolve --applied "0_init" --schema=prisma/schema.production.prisma
```

## 📞 トラブルシューティング

### よくある問題と解決方法

#### 1. スキーマ変更後にエラーが発生
```bash
# Prismaクライアント再生成
npm run db:generate
# スキーマ再適用
npm run db:push
```

#### 2. ローカルデータベースをリセットしたい
```bash
# SQLiteファイル削除
rm prisma/dev.db
# データベース再作成 + シード
npm run db:migrate
```

#### 3. 本番環境でマイグレーションエラー
```bash
# スキーマを強制適用（データ損失の可能性あり）
npx prisma db push --force-reset --schema=prisma/schema.production.prisma
```

#### 4. Prisma Studioが起動しない
```bash
# ポート指定で起動
npx prisma studio --port 5556
```

## 📚 参考リンク

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Push](https://www.prisma.io/docs/reference/api-reference/command-reference#db-push)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
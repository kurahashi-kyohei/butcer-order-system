#!/bin/bash

# Vercelデプロイ用データベース初期化スクリプト

echo "🚀 データベースセットアップを開始します..."

# Prismaクライアント生成
echo "📦 Prismaクライアントを生成中..."
npx prisma generate

# データベーススキーマ適用
echo "🗄️ データベーススキーマを適用中..."
npx prisma db push

# シードデータ投入
echo "🌱 シードデータを投入中..."
npx tsx prisma/seed.ts

echo "✅ データベースセットアップが完了しました！"
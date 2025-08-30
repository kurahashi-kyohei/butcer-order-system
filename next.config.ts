/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify向け最適化設定
  images: {
    unoptimized: true, // Netlifyでの画像最適化を無効化
  },
  eslint: {
    ignoreDuringBuilds: true, // ビルド時のESLintエラーを無視
  },
  typescript: {
    ignoreBuildErrors: true, // ビルド時のTypeScriptエラーを無視（本番では false に設定）
  },
  // Netlify Functions対応
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
  }
}

module.exports = nextConfig
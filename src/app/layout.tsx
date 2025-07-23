import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ブッチャー丸幸",
  description: "新鮮で高品質な精肉をお届けします。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Cormorant_Garamond, Inter, DM_Mono } from "next/font/google";
import { siteConfig } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: `${siteConfig.name} | Settlement Infrastructure for the Global Freelance Economy`,
  description: "Stablelane is a stablecoin-native revenue OS built on Arc. Milestone escrow, AI-powered invoice management, payout splits, and an on-chain Revenue Passport. Powered by Circle.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: `${siteConfig.name} | Settlement Infrastructure for the Global Freelance Economy`,
    description: "Stablelane is a stablecoin-native revenue OS built on Arc. Milestone escrow, AI-powered invoice management, payout splits, and an on-chain Revenue Passport. Powered by Circle.",
    images: ["/og/stablelane-og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Settlement Infrastructure for the Global Freelance Economy`,
    description: "Stablelane is a stablecoin-native revenue OS built on Arc. Milestone escrow, AI-powered invoice management, payout splits, and an on-chain Revenue Passport. Powered by Circle.",
    images: ["/og/stablelane-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

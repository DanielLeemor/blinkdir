
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WalletProvider } from "./components/WalletProvider";

export const metadata: Metadata = {
  title: "BlinkDir | Discover the Best Solana Actions & Blinks",
  description: "The premier directory for Solana Blinks. Discover, submit, and explore the best blockchain links in the ecosystem.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <WalletProvider>
          <div className="bg-gradient"></div>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}

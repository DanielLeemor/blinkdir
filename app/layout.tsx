
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlinkDir | Discover the Best Solana Actions & Blinks",
  description: "The premier directory for Solana Blinks. Discover, submit, and explore the best blockchain links in the ecosystem.",
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
        <div className="bg-gradient"></div>
        {children}
      </body>
    </html>
  );
}

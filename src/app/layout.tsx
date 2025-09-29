import type { Metadata } from "next";
import "./globals.css";
import BackButton from "../components/BackButton";
import { DidProvider } from "../components/DidProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";

// Load Inter font and set a CSS variable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "W3b Stitch - Trust Engine",
  description: "Decentralized trust engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <DidProvider>
          <BackButton />
          {children}
        </DidProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

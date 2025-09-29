import type { Metadata } from "next";
import "./globals.css";
import BackButton from "../components/BackButton";
import { DidProvider } from "../components/DidProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W3b Stitch- Trust Engine",
  description: "Decentralized trust engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>
        <DidProvider>
          <BackButton />
          {children}
        </DidProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackButton />
        {children}
        <SpeedInsights />
      </body>
   </html>
  );
}

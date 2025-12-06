import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Particles } from "@/components/ui/particles";
import { GlobalChatbot } from "@/components/ui/global-chatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SideDuit",
  description: "Financial Dashboard & OCR Expense Tracker",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "SideDuit",
    description: "Financial Dashboard & OCR Expense Tracker",
    images: ["/logo.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SideDuit",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen pb-16 md:pb-0 md:pt-16`}
      >
        <AuroraBackground>
          <Particles
            className="absolute inset-0 z-0 pointer-events-none"
            quantity={100}
            ease={80}
            color="#000000"
            refresh
          />
          <Navbar />
          {children}
          <GlobalChatbot />
        </AuroraBackground>
      </body>
    </html>
  );
}

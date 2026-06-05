import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import AuthProvider from "@/providers/AuthProvider"
import { CartProvider } from "@/providers/CartProvider"
import CookieConsent from "@/components/ui/CookieConsent"
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NU Robot Club | Naresuan University",
  description: "NU Robot Club, Naresuan University",
  keywords: ["NU Robot Club", "Naresuan University", "nurobot", "robot", "CPE", "computer engineering", "NU"],
  icons: {
    icon: "/Robot.png",
  },
  verification: {
    google: "Ka6GIGmqo2vH4uCSUOzT03GouosLxSl1iiBAp_23JQA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable} font-sans`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />

            <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 via-white text-gray-900">
              {children}
            </main>

            <Footer />
            <CookieConsent />
            <Toaster position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


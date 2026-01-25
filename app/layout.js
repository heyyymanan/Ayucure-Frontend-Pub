import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar.jsx";
import Footer from "@/components/footer.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

import ScrollToTop from "./functions/scrollToTop";
import FloatingCart from "@/components/ui/floating_cart";
import Msg91OtpScript from "@/components/msg91Inject";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
 
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Verification meta belongs in head */}
        <meta
          name="google-site-verification"
          content="OgqfdPeXzgaIRi6ZIyf8w4mvNBVxTdagT9SYP9TMeFc"
        />

      <Msg91OtpScript/>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <Navbar />
          <ScrollToTop />
          <main>{children}</main>
          <FloatingCart />
          <Footer />
        </CartProvider>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

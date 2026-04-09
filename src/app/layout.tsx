import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Suspense } from "react";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import SessionWrapper from "@/components/session-wrapper";
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    template: "%s | Minibank",
    default: "Minibank - Ваш цифровий банк",
  },
  description:
    "Управління картками, перекази та повна історія транзакцій в одному особистому кабінеті.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Minibank",
    title: "Minibank - Ваш цифровий банк",
    description: "Управління картками та перекази в одному місці.",
    locale: "uk_UA",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" className={montserrat.variable}>
      <body className={montserrat.className}>
        <SessionWrapper>
          <div className="bg-surface-app font-montserrat text-ink-strong relative flex min-h-screen w-full flex-col text-left text-xl">
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <div className="flex w-full flex-1 flex-col items-center gap-6 py-6">
              {children}
            </div>
            <Footer />
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}

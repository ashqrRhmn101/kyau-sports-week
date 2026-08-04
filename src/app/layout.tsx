import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopLoader from "@/components/TopLoader";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "University Sports Week — Football",
  description: "ইউনিভার্সিটি স্পোর্টস উইক ফুটবল টুর্নামেন্টের প্লেয়ার, টিম, ম্যাচ ও স্ট্যাটস প্ল্যাটফর্ম",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" data-theme="sportsweek" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <TopLoader />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html lang="bn" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">{children}</main>
      </body>
    </html>
  );
}

import type React from "react"
import type { Metadata } from "next"
import { Inter, Work_Sans } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: "Sistem Tracking Pesan & Workflow - Kementerian Lingkungan Hidup",
  description: "Sistem pelacakan pesan dan alur kerja resmi Kementerian Lingkungan Hidup Republik Indonesia",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${workSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

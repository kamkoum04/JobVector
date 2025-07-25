import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import ReduxProvider from "@/components/providers/redux-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobVector - AI-Powered Job Matching Platform",
  description:
    "Find your perfect job with AI-powered matching. Connect with top employers in Tunisia and discover opportunities that match your skills.",
  keywords: "jobs, careers, employment, Tunisia, AI matching, job search",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  )
}

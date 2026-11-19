import React from "react"
import type { Metadata } from 'next'
import { Barlow } from 'next/font/google'
import { LanguageProvider } from '@/contexts/language-context'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageToggle } from '@/components/layout/language-toggle'
import { Toaster } from "sonner"
import './globals.css'

// One family for the whole site (headings included).
const bodyFont = Barlow({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: 'Swish Tac Toe · NBA Trivia Grid',
  description: 'Name an NBA player who fits both the row and the column. 3×3 to 5×5 grids, 5,139 players, solo or 1v1.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${bodyFont.variable} font-sans antialiased dark bg-canvas text-ink`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
            
            {/* Global language toggle (bottom right, desktop only; on mobile it lives in the menu) */}
            <div className="fixed bottom-s16 right-s16 z-[9999] hidden lg:block">
               <LanguageToggle />
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import React from "react"
import type { Metadata } from 'next'
import { Oswald, Roboto } from 'next/font/google'

import './globals.css'

const oswald = Oswald({ subsets: ["latin"], variable: "--font-heading" });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: 'Swish Tac Toe - Official NBA Grid Game',
  description: 'The official-style NBA trivia game. Test your knowledge with the daily grid.',
}

import { LanguageProvider } from '@/contexts/language-context'
import { LanguageToggle } from '@/components/language-toggle'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${roboto.variable} font-sans antialiased dark bg-[#000000]`}>
        <LanguageProvider>
          {children}
          
          {/* Global Language Toggle (Bottom Right) */}
          <div className="fixed bottom-4 right-4 z-[9999]">
             <LanguageToggle />
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}

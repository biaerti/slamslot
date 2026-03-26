import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SlamSlot — Zapisy na slamy poetyckie',
  description: 'SlamSlot — prosta aplikacja do zarządzania zapisami na slamy poetyckie.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f0f0f0]" suppressHydrationWarning>
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}

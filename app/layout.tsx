import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Tackle Wala - Premium Fishing Tackle & Equipment",
  description: "Shop premium fishing tackle, rods, reels, lures, and accessories at Tackle Wala.",
  keywords: ["Tackle Wala", "fishing tackle", "fishing equipment", "rods", "reels", "lures"],
  authors: [{ name: "Tackle Wala" }],
  icons: {
    icon: '/favicon.ico', // path from /public
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

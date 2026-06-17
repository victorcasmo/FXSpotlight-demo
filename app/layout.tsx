import type { Metadata } from "next"
import { Analytics } from '@vercel/analytics/next'
import "./globals.css"

export const metadata: Metadata = {
  title: "FXSpotlight - Decision Enforcement System",
  description: "The Decision Enforcement System for professional traders. Position sizing, risk management, and trading discipline.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

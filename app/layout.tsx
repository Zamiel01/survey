import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Survey Management System',
  description: 'Traffic and Parking Survey Management System for Douala Districts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
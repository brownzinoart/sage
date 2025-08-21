import './globals.css'
import { Inter } from 'next/font/google'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

// Single font family for consistency
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata = {
  title: 'Sage - Your Wise Guide to Hemp Wellness',
  description: 'Discover hemp and CBD products through thoughtful conversation and personalized recommendations.',
  keywords: 'hemp, CBD, wellness, North Carolina, digital budtender',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
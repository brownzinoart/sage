import './globals.css'
import { Poppins, Playfair_Display } from 'next/font/google'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

// Modern trending font stack for 2025
const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
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
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body className="font-poppins antialiased">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
import './globals.css'
import { Inter, Quicksand } from 'next/font/google'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata = {
  title: 'BudGuide - Your Gentle Guide to Wellness',
  description: 'Discover hemp and CBD products through thoughtful conversation and personalized recommendations.',
  keywords: 'hemp, CBD, wellness, North Carolina, digital budtender',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${quicksand.variable}`}>
      <body className="font-body antialiased">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}
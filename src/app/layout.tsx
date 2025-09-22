import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Navigation, MobileNavigation } from '@/components/layout/Navigation'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventiq - AI-Powered Inventory Management',
  description: 'Intelligent product inventory management through multi-angle photography and AI-powered product identification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="h-screen flex flex-col overflow-hidden">
            <Navigation />
            <main className="flex-1 min-h-0 overflow-auto pb-16 md:pb-0">
              {children}
            </main>
            <MobileNavigation />
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
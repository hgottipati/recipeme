import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic'

// Simple AuthProvider wrapper that only renders on client
function ClientOnlyAuthProvider({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') {
    return <>{children}</>
  }
  
  const { AuthProvider } = require('@/contexts/AuthContext')
  return <AuthProvider>{children}</AuthProvider>
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe AI - Intelligent Recipe Management',
  description: 'AI-powered recipe app that standardizes and personalizes recipes from any source',
  keywords: ['recipe', 'ai', 'cooking', 'food', 'meal planning'],
  authors: [{ name: 'Recipe AI Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientOnlyAuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ClientOnlyAuthProvider>
      </body>
    </html>
  )
}

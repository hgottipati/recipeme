import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'

// Dynamically import AuthProvider to prevent SSR issues
const AuthProvider = dynamic(() => import('@/contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe AI - Intelligent Recipe Management',
  description: 'AI-powered recipe app that standardizes and personalizes recipes from any source',
  keywords: ['recipe', 'ai', 'cooking', 'food', 'meal planning'],
  authors: [{ name: 'Recipe AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  )
}

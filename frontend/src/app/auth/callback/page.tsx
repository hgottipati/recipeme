'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleOAuthLogin } = useAuth()

  useEffect(() => {
    const token = searchParams?.get('token')
    const success = searchParams?.get('success')
    const error = searchParams?.get('error')

    const handleAuthCallback = async () => {
      if (success === 'true' && token) {
        try {
          await handleOAuthLogin(token)
          toast.success('Successfully signed in with Google!')
          router.push('/')
        } catch (error: any) {
          toast.error('Failed to complete sign in. Please try again.')
          router.push('/login')
        }
      } else if (error) {
        toast.error('Failed to sign in with Google. Please try again.')
        router.push('/login')
      } else {
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [searchParams, router, handleOAuthLogin])

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

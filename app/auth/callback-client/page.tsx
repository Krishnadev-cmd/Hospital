'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

export default function CallbackClientPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Handle the authentication callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (data.session) {
          // Successfully authenticated
          router.push('/')
        } else {
          // No session found, try to get from URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          
          if (accessToken && refreshToken) {
            // Set the session using the tokens from URL
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (setSessionError) {
              console.error('Set session error:', setSessionError)
              router.push('/login?error=auth_failed')
            } else {
              router.push('/')
            }
          } else {
            router.push('/login?error=no_tokens')
          }
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import supabase from '@/lib/supabase'

export default function CallbackClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = searchParams.get('code')
        
        if (code) {
          // Handle PKCE flow - exchange code for session on client-side
          console.log('Handling PKCE flow with code:', code)
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('PKCE exchange error:', error)
            router.push('/login?error=auth_failed')
            return
          }
          
          if (data.session) {
            console.log('PKCE authentication successful')
            router.push('/')
            return
          }
        }

        // Check if there's already a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/login?error=auth_failed')
          return
        }

        if (sessionData.session) {
          // Already authenticated
          router.push('/')
          return
        }

        // Handle implicit flow - check URL hash for tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Handling implicit flow with tokens from hash')
          // Set the session using the tokens from URL hash
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (setSessionError) {
            console.error('Set session error:', setSessionError)
            router.push('/login?error=auth_failed')
          } else {
            console.log('Implicit flow authentication successful')
            router.push('/')
          }
        } else {
          // No code, no session, no tokens - redirect to login
          console.log('No authentication data found, redirecting to login')
          router.push('/login?error=no_auth_data')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    handleAuth()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
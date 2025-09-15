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
        // First, let Supabase handle the callback automatically
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
        } else if (sessionData.session) {
          console.log('Session found, redirecting to dashboard')
          router.push('/')
          return
        }

        // If no session, try to handle the URL parameters manually
        const code = searchParams.get('code')
        const accessToken = searchParams.get('access_token')
        
        // Handle implicit flow from URL hash
        if (!code && !accessToken && typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const hashAccessToken = hashParams.get('access_token')
          const hashRefreshToken = hashParams.get('refresh_token')
          
          if (hashAccessToken) {
            console.log('Handling implicit flow with access token from hash')
            const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken || ''
            })
            
            if (setSessionError) {
              console.error('Set session error:', setSessionError)
              router.push('/login?error=auth_failed')
              return
            }
            
            if (setSessionData.session) {
              console.log('Implicit authentication successful')
              router.push('/')
              return
            }
          }
        }

        // Handle authorization code flow
        if (code) {
          console.log('Handling authorization code flow with code:', code)
          
          // Debug: Check what's in localStorage
          console.log('LocalStorage contents:', {
            keys: Object.keys(localStorage),
            allSupabaseKeys: Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-')),
            allAuthKeys: Object.keys(localStorage).filter(key => key.includes('auth')),
            allItems: Object.entries(localStorage)
          })
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Code exchange error:', error)
            // Try alternative: get session which might work
            const { data: altSessionData } = await supabase.auth.getSession()
            if (altSessionData.session) {
              console.log('Alternative session check successful')
              router.push('/')
              return
            }
            router.push('/login?error=auth_failed')
            return
          }
          
          if (data.session) {
            console.log('Code exchange successful')
            router.push('/')
            return
          }
        }

        // Handle implicit flow from URL parameters
        if (accessToken) {
          console.log('Handling implicit flow with access token from URL params')
          const refreshToken = searchParams.get('refresh_token')
          const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (setSessionError) {
            console.error('Set session error:', setSessionError)
            router.push('/login?error=auth_failed')
            return
          }
          
          if (setSessionData.session) {
            console.log('Implicit authentication successful')
            router.push('/')
            return
          }
        }

        // No valid authentication found
        console.log('No valid authentication found, redirecting to login')
        router.push('/login?error=no_auth_data')
        
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    // Add a small delay to ensure URL params are available
    const timer = setTimeout(handleAuth, 100)
    return () => clearTimeout(timer)
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
import supabase from "@/lib/supabase";

export const handleSignInWithGoogle = async () => {
    try {   
      await supabase.auth.signOut()
      
      // Clear any existing auth data
      localStorage.removeItem('sb-jrlrwwbvhspechxaodrd-auth-token')
      localStorage.removeItem('supabase.auth.token')
      
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('Using redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      console.log('OAuth Response:', data, error);

      if (error) {
        console.error('Error signing in with Google:', error)
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  } 

export const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
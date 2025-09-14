import { supabaseServer } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  
  if (code) {
    // Handle PKCE flow (recommended)
    const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('PKCE exchange error:', error);
      return NextResponse.redirect(new URL(`/login?error=auth_failed`, req.url));
    }

    // Successfully authenticated with PKCE
    const response = NextResponse.redirect(new URL("/", req.url));
    
    // Set session cookies if needed
    if (data.session) {
      response.cookies.set('supabase-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in
      });
    }
    
    return response;
  }

  // If no code parameter, this might be an implicit flow callback
  // Redirect to a client-side handler
  return NextResponse.redirect(new URL("/auth/callback-client", req.url));
}
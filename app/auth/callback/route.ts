import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // For PKCE flow, the code exchange must happen on the client-side
  // where the code verifier is stored. Redirect to client-side handler.
  const url = new URL("/auth/callback-client", req.url);
  
  // Forward all query parameters to the client-side handler
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(url);
}
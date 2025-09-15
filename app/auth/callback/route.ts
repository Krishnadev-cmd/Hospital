import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // Always redirect to client-side handler for both flows
  const url = new URL("/auth/callback-client", req.url);
  
  // Forward all query parameters to the client-side handler
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(url);
}
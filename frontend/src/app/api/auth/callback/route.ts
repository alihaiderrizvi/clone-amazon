import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Use forwarded host header (set by Render/Vercel) or fallback to env variable
  // This avoids using the internal origin (e.g., localhost:10000 on Render)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost 
    ? `${protocol}://${forwardedHost}` 
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

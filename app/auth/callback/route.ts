// app/auth/callback/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type') // 'recovery' o 'signup'

    if (code) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Error en callback:', error)
        return NextResponse.redirect(new URL('/?error=auth_callback_failed', requestUrl.origin))
      }
      
      console.log('✅ Sesión intercambiada exitosamente. Tipo:', type)
      
      // Si es recovery, redirige a la página de cambio de contraseña
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/update-password', requestUrl.origin))
      }
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (error) {
    console.error('💥 Error inesperado en callback:', error)
    return NextResponse.redirect(new URL('/?error=unexpected', requestUrl.origin))
  }
}
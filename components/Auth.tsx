'use client'
import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [showResetSuccess, setShowResetSuccess] = useState<boolean>(false)
  const router = useRouter()

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowResetSuccess(false)

    try {
      console.log('🔐 Intentando autenticación...', { email, isSignUp })

      if (isSignUp) {
        // REGISTRO
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password: password.trim(),
        })
        
        console.log('📝 Respuesta registro:', { data, error })
        
        if (error) {
          throw new Error(`Error al registrar: ${error.message}`)
        }
        
        if (data.user) {
          alert('✅ ¡Cuenta creada exitosamente! Ya puedes iniciar sesión.')
          setIsSignUp(false)
          setEmail('')
          setPassword('')
        }
      } else {
        // LOGIN - Método más robusto
        console.log('🚀 Intentando login...')
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password.trim(),
        })
        
        console.log('🔑 Respuesta login:', { 
          user: data?.user ? 'SI' : 'NO', 
          session: data?.session ? 'SI' : 'NO',
          error: error 
        })
        
        if (error) {
          // Mostrar error específico
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email o contraseña incorrectos. Verifica tus credenciales.')
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Por favor confirma tu email antes de iniciar sesión.')
          } else {
            throw new Error(`Error de autenticación: ${error.message}`)
          }
        }
        
        if (data.user && data.session) {
          console.log('🎉 Login exitoso!')
          // Redirección más confiable
          window.location.href = '/dashboard'
        }
      }
    } catch (error: any) {
      console.error('💥 Error completo:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (): Promise<void> => {
  if (!email) {
    setError('Por favor ingresa tu email para recuperar la contraseña')
    return
  }

  setLoading(true)
  setError('')
  setShowResetSuccess(false)

  try {
    console.log('📧 Enviando email de recuperación...', { email: email.toLowerCase().trim() })
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    console.log('✅ Email de recuperación enviado')
    setShowResetSuccess(true)
  } catch (error: any) {
    console.error('❌ Error enviando email de recuperación:', error)
    setError(error.message)
  } finally {
    setLoading(false)
  }
}

  const signInWithMagicLink = async (): Promise<void> => {
    if (!email) {
      setError('Por favor ingresa tu email')
      return
    }

    setLoading(true)
    setError('')
    setShowResetSuccess(false)

    try {
      console.log('🔗 Enviando enlace mágico...', { email: email.toLowerCase().trim() })
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      console.log('✅ Enlace mágico enviado')
      setShowResetSuccess(true)
      alert('🔗 Enlace mágico enviado a tu email. Revisa tu bandeja de entrada.')
    } catch (error: any) {
      console.error('❌ Error enviando enlace mágico:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">SF</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Crear cuenta' : 'Bienvenido a StackFlow'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isSignUp ? 'Comienza a gestionar tus proyectos' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {showResetSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    ✅ Email enviado exitosamente. Revisa tu bandeja de entrada.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Botones de recuperación y enlace mágico */}
          {!isSignUp && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={resetPassword}
                disabled={loading || !email}
                className="w-full text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed py-2"
              >
                ¿Olvidaste tu contraseña?
              </button>
              
              <div className="border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={signInWithMagicLink}
                  disabled={loading || !email}
                  className="w-full text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-2 font-medium"
                >
                  📧 Enviar enlace mágico (sin contraseña)
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setShowResetSuccess(false)
                setEmail('')
                setPassword('')
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          {/* Información para testing */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Para testing:</strong> Usa el enlace mágico o recupera tu contraseña
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
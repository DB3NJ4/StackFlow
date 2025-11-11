'use client'
import { supabase } from '../lib/supabase'
import { User } from '../types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StackFlow</span>
            </Link>
            
            {/* Navegación */}
            <nav className="flex space-x-1">
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                📊 Tablero
              </Link>
              <Link 
                href="/projects" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/projects') 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                📋 Proyectos
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-white border border-gray-300 hover:border-purple-300 text-gray-700 hover:text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  Folder, 
  CheckSquare, 
  BarChart3,
  Settings,
  LogOut,
  Users
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

interface DashboardSidebarProps {
  user: {
    email: string
    id: string
  }
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Proyectos',
    href: '/projects',
    icon: Folder,
  },
  {
    name: 'Tareas',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Equipo',
    href: '/teams',
    icon: Users,
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SF</span>
        </div>
        <span className="text-xl font-bold text-gray-900">StackFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User info & actions */}
      <div className="p-4 border-t border-gray-200">
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">Usuario</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600 hover:text-purple-600">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-gray-600 hover:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import { StatsCards } from '../../components/StatsCards'
import { RecentProjects } from '../../components/RecentProjects'
import { useAuth } from '../../hooks/useAuth'
import { QuickActions } from '../../components/QuickActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Bell } from 'lucide-react'

export default function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-lg text-gray-600">No autenticado</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <DashboardSidebar user={user} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bienvenido de vuelta, {user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Hoy: {new Date().toLocaleDateString('es-ES')}
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            <StatsCards />

            {/* Projects and Activity */}
            <div className="grid gap-6 md:grid-cols-3">
                <RecentProjects />
                <QuickActions />
            </div>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas actualizaciones del equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "Ana García", action: "completó la tarea", target: "Diseño de login", time: "Hace 2 horas" },
                    { user: "Carlos López", action: "comentó en", target: "Revisión API", time: "Hace 4 horas" },
                    { user: "María Rodríguez", action: "creó el proyecto", target: "Documentación", time: "Hace 1 día" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-sm font-medium">
                          {activity.user.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
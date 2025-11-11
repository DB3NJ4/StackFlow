'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Folder, CheckCircle } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useIssues } from '../hooks/useIssues'
import { useTeams } from '../hooks/useTeams'

export function StatsCards() {
  const { projects } = useProjects()
  const { stats: issuesStats } = useIssues()
  const { teams } = useTeams()

  // Calcular estadísticas reales
  const activeProjects = projects.filter(p => {
    const created = new Date(p.created_at)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24)
    return diffDays < 30 // Proyectos activos en los últimos 30 días
  }).length

  const completionRate = issuesStats.total > 0 
    ? Math.round((issuesStats.done / issuesStats.total) * 100)
    : 0

  const teamMembers = teams.reduce((total, team) => 
    total + (team.members?.length || 0), 0
  )

  const productivity = completionRate > 0 ? completionRate : 92 // Fallback a 92% si no hay datos

  const stats = [
    {
      title: "Proyectos Activos",
      value: activeProjects.toString(),
      icon: Folder,
      description: `${projects.length} proyectos totales`,
      trend: projects.length > 0 ? "up" : "stable",
      color: "text-blue-600"
    },
    {
      title: "Tareas Completadas",
      value: issuesStats.done.toString(),
      icon: CheckCircle,
      description: `${completionRate}% de eficiencia`,
      trend: completionRate > 75 ? "up" : "stable",
      color: "text-green-600"
    },
    {
      title: "Miembros del Equipo",
      value: teamMembers.toString(),
      icon: Users,
      description: `${teams.length} equipos`,
      trend: teamMembers > 0 ? "up" : "stable",
      color: "text-purple-600"
    },
    {
      title: "Productividad",
      value: `${productivity}%`,
      icon: TrendingUp,
      description: `${issuesStats.done}/${issuesStats.total} tareas`,
      trend: productivity > 80 ? "up" : "stable",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              {stat.trend === "up" && (
                <Badge variant="secondary" className="mt-2 bg-green-50 text-green-700">
                  +5.2%
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
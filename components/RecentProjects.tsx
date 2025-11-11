'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Users, Plus } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useTeams } from '../hooks/useTeams'
import { useState } from 'react'

export function RecentProjects() {
  const { projects, loading, createProject } = useProjects()
  const { teams } = useTeams()
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      setIsCreating(true)
      await createProject(newProjectName.trim())
      setNewProjectName('')
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24)
    
    if (diffDays < 7) {
      return {
        variant: "bg-blue-50 text-blue-700 border-blue-200",
        text: "Activo"
      }
    } else if (diffDays < 30) {
      return {
        variant: "bg-green-50 text-green-700 border-green-200",
        text: "En progreso"
      }
    } else {
      return {
        variant: "bg-orange-50 text-orange-700 border-orange-200",
        text: "Pendiente"
      }
    }
  }

  const getProgress = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24)
    
    // Simular progreso basado en la antigüedad del proyecto
    if (diffDays < 7) return 25
    if (diffDays < 14) return 50
    if (diffDays < 21) return 75
    return 100
  }

  const getTeamMembersCount = (projectId: string) => {
    // Por ahora simulamos miembros del equipo
    // Más adelante puedes conectar con la tabla project_teams
    return Math.floor(Math.random() * 5) + 1
  }

  const getProjectColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proyectos Recientes</CardTitle>
            <CardDescription>Cargando proyectos...</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="h-4 bg-gray-300 rounded w-32 animate-pulse" />
                      <div className="h-5 bg-gray-300 rounded w-20 animate-pulse" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-3 bg-gray-300 rounded w-24 animate-pulse" />
                      <div className="h-3 bg-gray-300 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <div className="h-3 bg-gray-300 rounded w-12 animate-pulse" />
                      <div className="h-3 bg-gray-300 rounded w-8 animate-pulse" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-1/2 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Proyectos Recientes</CardTitle>
          <CardDescription>
            {projects.length} proyectos en total
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Crear nuevo proyecto */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nombre del nuevo proyecto..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <Button 
              onClick={handleCreateProject}
              disabled={isCreating || !newProjectName.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <p>No hay proyectos aún</p>
              <p className="text-sm">Crea tu primer proyecto arriba</p>
            </div>
          ) : (
            projects.slice(0, 4).map((project, index) => {
              const status = getStatusBadge(project.created_at)
              const progress = getProgress(project.created_at)
              const teamMembers = getTeamMembersCount(project.id)
              const dueDate = new Date(project.created_at)
              dueDate.setDate(dueDate.getDate() + 30) // Fecha límite: 30 días después de creación

              return (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-3 h-3 ${getProjectColor(index)} rounded-full`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {project.name}
                        </h4>
                        <Badge variant="outline" className={status.variant}>
                          {status.text}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Vence: {dueDate.toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{teamMembers} miembros</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
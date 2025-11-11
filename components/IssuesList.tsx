'use client'
import { Issue, Project } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, User, Folder, Edit, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface IssuesListProps {
  issues: Issue[]
  projects: Project[]
  onIssueUpdate: (issueId: string, updates: any) => void
  onIssueDelete: (issueId: string) => void
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusLabels = {
  todo: 'Por Hacer',
  in_progress: 'En Progreso',
  review: 'En Revisión',
  done: 'Completado'
}

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica'
}

export function IssuesList({ issues, projects, onIssueUpdate, onIssueDelete }: IssuesListProps) {
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Proyecto no encontrado'
  }

  const handleStatusChange = (issueId: string, newStatus: string) => {
    onIssueUpdate(issueId, { status: newStatus })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Tareas</CardTitle>
        <CardDescription>
          {issues.length} tareas encontradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {issue.title}
                    </h3>
                    <Badge variant="outline" className={statusColors[issue.status]}>
                      {statusLabels[issue.status]}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[issue.priority]}>
                      {priorityLabels[issue.priority]}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Folder className="h-3 w-3" />
                      <span>{getProjectName(issue.project_id)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Creado: {new Date(issue.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    {issue.description && (
                      <p className="text-gray-600 truncate max-w-md">
                        {issue.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Selector de estado rápido */}
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todo">Por Hacer</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="review">En Revisión</option>
                  <option value="done">Completado</option>
                </select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onIssueDelete(issue.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
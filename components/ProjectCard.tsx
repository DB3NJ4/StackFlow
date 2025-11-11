import { Project } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, User } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-purple-100">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {project.description || 'Sin descripción'}
            </CardDescription>
          </div>
          <div className="flex space-x-1 ml-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-purple-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(project.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
              Activo
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>0 tareas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
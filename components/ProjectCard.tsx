// components/ProjectCard.tsx - Versión actualizada
import { Project } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users, Folder } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
  onShare: (project: Project) => void
  canEdit?: boolean
  canDelete?: boolean
  canShare?: boolean
}

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onShare,
  canEdit = true,
  canDelete = true,
  canShare = true
}: ProjectCardProps) {
  const isOwner = canEdit && canDelete && canShare

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Folder className="h-5 w-5 text-purple-500" />
            <span className="truncate">{project.name}</span>
          </div>
          {!isOwner && (
            <Badge variant="secondary" className="text-xs">
              Compartido
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description || 'Sin descripción'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Creado: {new Date(project.created_at).toLocaleDateString()}
          </div>
          
          <div className="flex items-center space-x-1">
            {canShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(project)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                title="Compartir proyecto"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(project)}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                title="Editar proyecto"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(project.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                title="Eliminar proyecto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
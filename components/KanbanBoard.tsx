'use client'
import { useState } from 'react'
import { Issue, IssueStatus } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, User, Calendar, Flag, Folder } from 'lucide-react'
import { CreateIssueDialog } from './CreateIssueDialog'

interface KanbanBoardProps {
  issues: Issue[]
  projects: any[]
  onIssueCreate: (issue: any) => void
  onIssueUpdate: (issueId: string, updates: any) => void
  onIssueDelete: (issueId: string) => void
}

const statusConfig = {
  todo: {
    title: 'Por Hacer',
    color: 'bg-gray-100 border-gray-300',
    textColor: 'text-gray-700',
    badgeColor: 'bg-gray-500',
    columnColor: 'border-l-gray-400'
  },
  in_progress: {
    title: 'En Progreso',
    color: 'bg-blue-100 border-blue-300',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-500',
    columnColor: 'border-l-blue-400'
  },
  review: {
    title: 'En Revisión',
    color: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-500',
    columnColor: 'border-l-yellow-400'
  },
  done: {
    title: 'Completado',
    color: 'bg-green-100 border-green-300',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-500',
    columnColor: 'border-l-green-400'
  }
}

const priorityConfig = {
  low: { 
    label: 'Baja', 
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    iconColor: 'text-gray-500'
  },
  medium: { 
    label: 'Media', 
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    iconColor: 'text-blue-500'
  },
  high: { 
    label: 'Alta', 
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    iconColor: 'text-orange-500'
  },
  critical: { 
    label: 'Crítica', 
    color: 'bg-red-100 text-red-700 border-red-300',
    iconColor: 'text-red-500'
  }
}

export function KanbanBoard({ issues, projects, onIssueCreate, onIssueUpdate, onIssueDelete }: KanbanBoardProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>('todo')

  const issuesByStatus = {
    todo: issues.filter(issue => issue.status === 'todo'),
    in_progress: issues.filter(issue => issue.status === 'in_progress'),
    review: issues.filter(issue => issue.status === 'review'),
    done: issues.filter(issue => issue.status === 'done')
  }

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('issueId', issueId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: IssueStatus) => {
    e.preventDefault()
    const issueId = e.dataTransfer.getData('issueId')
    
    try {
      await onIssueUpdate(issueId, { status: newStatus })
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert('Error al cambiar el estado de la tarea')
    }
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Proyecto no encontrado'
  }

  const handleCreateIssue = (issueData: any) => {
    console.log('🎯 Datos de la tarea desde el diálogo:', issueData)
    onIssueCreate(issueData)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getPriorityConfig = (priority: keyof typeof priorityConfig) => {
    return priorityConfig[priority] || priorityConfig.medium
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex flex-col min-h-[600px]">
            {/* Column Header */}
            <div className={`p-4 rounded-lg border ${config.color} ${config.textColor} mb-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.badgeColor}`} />
                  <h3 className="font-semibold text-sm">{config.title}</h3>
                  <Badge variant="secondary" className="bg-white/50 text-xs">
                    {issuesByStatus[status as IssueStatus].length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus(status as IssueStatus)
                    setCreateDialogOpen(true)
                  }}
                  className="h-7 w-7 p-0 hover:bg-white/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Issues List */}
            <div
              className={`flex-1 space-y-3 p-1 rounded-lg transition-colors duration-200 ${
                issuesByStatus[status as IssueStatus].length === 0 
                  ? 'border-2 border-dashed border-gray-300' 
                  : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status as IssueStatus)}
            >
              {issuesByStatus[status as IssueStatus].map((issue) => {
                const priority = getPriorityConfig(issue.priority)
                
                return (
                  <Card
                    key={issue.id}
                    className={`cursor-grab hover:shadow-md transition-all duration-200 border-l-4 ${config.columnColor} hover:scale-[1.02] active:cursor-grabbing`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                              {issue.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Folder className="h-3 w-3 text-purple-500 flex-shrink-0" />
                              <p className="text-xs text-purple-600 font-medium truncate">
                                {getProjectName(issue.project_id)}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Aquí podrías agregar un menú de opciones
                            }}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Description (si existe) */}
                        {issue.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {issue.description}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={`${priority.color} text-xs h-5`}
                            >
                              <Flag className={`h-2.5 w-2.5 mr-1 ${priority.iconColor}`} />
                              {priority.label}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">
                              {formatDate(issue.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Assignee and Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {issue.assigned_to ? 'Asignado' : 'Sin asignar'}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Aquí podrías implementar la edición
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                                  onIssueDelete(issue.id)
                                }
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Empty State */}
              {issuesByStatus[status as IssueStatus].length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm text-center">No hay tareas</p>
                  <p className="text-xs text-center mt-1">Arrastra tareas aquí o crea una nueva</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Issue Dialog */}
      <CreateIssueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projects={projects}
        defaultStatus={selectedStatus}
        onSubmit={handleCreateIssue}
      />
    </>
  )
}
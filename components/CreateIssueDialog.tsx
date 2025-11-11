'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IssueStatus, IssuePriority } from '../types'

interface CreateIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: any[]
  defaultStatus?: IssueStatus
  defaultProjectId?: string
  issue?: any
  onSubmit: (issue: any) => void
}

const statusOptions = [
  { value: 'todo', label: 'Por Hacer' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'review', label: 'En Revisión' },
  { value: 'done', label: 'Completado' }
]

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' }
]

export function CreateIssueDialog({ 
  open, 
  onOpenChange, 
  projects, 
  defaultStatus = 'todo',
  defaultProjectId, // ✅ Nueva prop
  issue,
  onSubmit 
}: CreateIssueDialogProps) {
  const [title, setTitle] = useState(issue?.title || '')
  const [description, setDescription] = useState(issue?.description || '')
  const [status, setStatus] = useState<IssueStatus>(issue?.status || defaultStatus)
  const [priority, setPriority] = useState<IssuePriority>(issue?.priority || 'medium')
  const [projectId, setProjectId] = useState(issue?.project_id || defaultProjectId || '') // ✅ Usar defaultProjectId
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description: description || null,
      status,
      priority,
      project_id: projectId
    })
    handleReset()
  }

  const handleReset = () => {
    setTitle('')
    setDescription('')
    setStatus(defaultStatus)
    setPriority('medium')
    setProjectId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{issue ? 'Editar Tarea' : 'Crear Nueva Tarea'}</DialogTitle>
          <DialogDescription>
            {issue ? 'Actualiza la información de la tarea' : 'Completa la información para crear una nueva tarea'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe la tarea..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales de la tarea..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Proyecto *</Label>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(value: IssueStatus) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={(value: IssuePriority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {issue ? 'Actualizar Tarea' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
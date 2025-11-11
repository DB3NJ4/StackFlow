import { useState, FormEvent } from 'react'
import { Project } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProjectFormProps {
  project?: Project | null
  onSubmit: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void
  onCancel: () => void
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || null,
    })
  }

  return (
    <Card className="mb-6 border-purple-200">
      <CardHeader>
        <CardTitle className="text-xl">
          {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </CardTitle>
        <CardDescription>
          {project ? 'Actualiza la información del proyecto' : 'Completa la información para crear un nuevo proyecto'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del Proyecto *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa el nombre del proyecto"
              required
              className="focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito y objetivos del proyecto..."
              rows={4}
              className="resize-none focus:ring-purple-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
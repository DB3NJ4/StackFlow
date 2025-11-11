'use client'
import { useState, useEffect } from 'react'
import { Team } from '../types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TeamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: Team
  onSubmit: (teamData: any) => void
}

export function TeamFormDialog({ open, onOpenChange, team, onSubmit }: TeamFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (team) {
      setName(team.name || '')
      setDescription(team.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [team, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('El nombre del equipo es requerido')
      return
    }
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || null
    })
  }

  const handleReset = () => {
    setName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{team ? 'Editar Equipo' : 'Crear Nuevo Equipo'}</DialogTitle>
          <DialogDescription>
            {team ? 'Actualiza la información del equipo' : 'Completa la información para crear un nuevo equipo'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Equipo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Equipo de Desarrollo Frontend"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito y responsabilidades del equipo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {team ? 'Actualizar Equipo' : 'Crear Equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
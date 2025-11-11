// components/ShareProjectDialog.tsx
'use client'

import { useState } from 'react'
import { useProjectSharing } from '../hooks/useProjectSharing'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, UserPlus, Users, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface ShareProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: any
}

export function ShareProjectDialog({ open, onOpenChange, project }: ShareProjectDialogProps) {
  const { shareProjectWithUser, getProjectSharedUsers, removeProjectAccess, loading, error } = useProjectSharing()
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState('view')
  const [sharedUsers, setSharedUsers] = useState<any[]>([])
  const [successMessage, setSuccessMessage] = useState('')

  const loadSharedUsers = async () => {
    if (project) {
      const users = await getProjectSharedUsers(project.id)
      setSharedUsers(users)
    }
  }

  const handleShare = async () => {
    if (!email.trim() || !project) return

    try {
      await shareProjectWithUser(project.id, email, accessLevel)
      setEmail('')
      setSuccessMessage(`Proyecto compartido con ${email}`)
      await loadSharedUsers()
    } catch (error) {
      // Error manejado en el hook
    }
  }

  const handleRemoveAccess = async (userId: string) => {
    try {
      await removeProjectAccess(project.id, userId)
      await loadSharedUsers()
    } catch (error) {
      // Error manejado en el hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir Proyecto</DialogTitle>
          <DialogDescription>
            Comparte "{project?.name}" con otros usuarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulario para compartir */}
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Ver</SelectItem>
                  <SelectItem value="comment">Comentar</SelectItem>
                  <SelectItem value="edit">Editar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleShare} 
              disabled={!email.trim() || loading}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Mensajes */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Usuarios con acceso */}
          <div>
            <h4 className="text-sm font-medium mb-2">Usuarios con acceso:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sharedUsers.map((shared) => (
                <div key={shared.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">
                      {shared.user?.full_name || shared.user?.email}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {shared.access_level}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAccess(shared.user_id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
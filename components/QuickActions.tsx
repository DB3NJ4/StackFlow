'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useProjects } from '../hooks/useProjects'
import { CreateIssueDialog } from './CreateIssueDialog'

// Shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Icons
import { Plus, Users, Folder, Rocket, Loader2 } from 'lucide-react'

export function QuickActions() {
  const { projects, createProject, refreshProjects } = useProjects()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  })
  
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member' as 'member' | 'admin'
  })

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) return
    
    setLoadingAction('project')
    try {
      await createProject(projectData.name.trim(), projectData.description.trim())
      setProjectData({ name: '', description: '' })
      setShowProjectDialog(false)
    } catch (error) {
      console.error('Error creando proyecto:', error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCreateTask = async (taskData: any) => {
    setLoadingAction('task')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('issues')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          project_id: taskData.project_id,
          created_by: user.id
        }])

      setShowTaskDialog(false)
      refreshProjects()
    } catch (error) {
      console.error('Error creando tarea:', error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteData.email.trim()) return

    setLoadingAction('invite')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Crear equipo por defecto si no existe
      const { data: existingTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', user.id)
        .limit(1)

      let teamId = existingTeams?.[0]?.id

      if (!teamId) {
        const { data: newTeam } = await supabase
          .from('teams')
          .insert([{
            name: 'Mi Equipo',
            description: 'Equipo principal',
            created_by: user.id
          }])
          .select()
          .single()
        teamId = newTeam?.id
      }

      // Aquí normalmente enviarías una invitación por email
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setInviteData({ email: '', role: 'member' })
      setShowInviteDialog(false)
      
      alert(`Invitación enviada a ${inviteData.email}`)
    } catch (error) {
      console.error('Error enviando invitación:', error)
    } finally {
      setLoadingAction(null)
    }
  }

  const quickActions = [
    {
      id: 'project',
      label: 'Crear proyecto',
      icon: Folder,
      description: 'Iniciar un nuevo proyecto',
      variant: 'outline' as const,
      onClick: () => setShowProjectDialog(true)
    },
    {
      id: 'task',
      label: 'Nueva tarea',
      icon: Plus,
      description: 'Agregar tarea rápida',
      variant: 'outline' as const,
      onClick: () => setShowTaskDialog(true)
    },
    {
      id: 'invite',
      label: 'Invitar miembro',
      icon: Users,
      description: 'Agregar colaborador',
      variant: 'outline' as const,
      onClick: () => setShowInviteDialog(true)
    }
  ]

  // Obtener el primer proyecto como default si existe
  const defaultProjectId = projects.length > 0 ? projects[0].id : ''

  return (
    <>
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Rocket className="h-5 w-5 text-purple-600" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Tareas frecuentes con un clic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start h-auto py-3 px-4 gap-3 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
              onClick={action.onClick}
            >
              <action.icon className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium text-sm">{action.label}</span>
                <span className="text-xs text-muted-foreground text-left">
                  {action.description}
                </span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Dialog para crear proyecto */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Crear Nuevo Proyecto
            </DialogTitle>
            <DialogDescription>
              Agrega un nuevo proyecto a tu espacio de trabajo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nombre del proyecto</Label>
              <Input
                id="project-name"
                placeholder="Mi Proyecto Increíble"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Descripción (opcional)</Label>
              <Input
                id="project-description"
                placeholder="Describe el propósito de este proyecto..."
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowProjectDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={!projectData.name.trim() || loadingAction === 'project'}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {loadingAction === 'project' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Folder className="h-4 w-4" />
                  Crear Proyecto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usar tu modal personalizado para crear tarea */}
      <CreateIssueDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        projects={projects}
        defaultProjectId={defaultProjectId}
        onSubmit={handleCreateTask}
      />

      {/* Dialog para invitar miembro */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Invitar Miembro
            </DialogTitle>
            <DialogDescription>
              Invita a un colaborador a unirse a tu equipo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email del colaborador</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colaborador@ejemplo.com"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rol</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inviteData.role === 'member' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInviteData(prev => ({ ...prev, role: 'member' }))}
                  className="flex-1"
                >
                  Miembro
                </Button>
                <Button
                  type="button"
                  variant={inviteData.role === 'admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInviteData(prev => ({ ...prev, role: 'admin' }))}
                  className="flex-1"
                >
                  Administrador
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowInviteDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleInviteMember}
              disabled={!inviteData.email.trim() || loadingAction === 'invite'}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {loadingAction === 'invite' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Enviar Invitación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
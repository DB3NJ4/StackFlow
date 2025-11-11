// app/teams/page.tsx
'use client'

import { useState } from 'react'
import { useTeams } from '../../hooks/useTeams'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Mail, Trash2, AlertCircle, Crown, User, Shield, Folder, Settings, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TeamsPage() {
  const { user } = useAuth()
  const { teams, loading, error, createTeam, inviteMember, removeMember, getTeamProjects, removeProjectFromTeam, deleteTeam } = useTeams()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [projectsDialogOpen, setProjectsDialogOpen] = useState(false)
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false)
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [teamProjects, setTeamProjects] = useState<any[]>([])
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })
  const [inviteData, setInviteData] = useState({ email: '', role: 'member' })
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return
    
    try {
      setActionError(null)
      setSuccessMessage(null)
      await createTeam(newTeam.name, newTeam.description)
      setNewTeam({ name: '', description: '' })
      setCreateDialogOpen(false)
      setSuccessMessage('✅ Equipo creado exitosamente!')
    } catch (error: any) {
      console.error('Error creating team:', error)
      setActionError(error.message)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteData.email.trim() || !selectedTeam) return

    try {
      setActionError(null)
      setSuccessMessage(null)
      await inviteMember(selectedTeam.id, inviteData.email, inviteData.role as any)
      setInviteData({ email: '', role: 'member' })
      setInviteDialogOpen(false)
      setSuccessMessage('✅ Invitación enviada exitosamente!')
    } catch (error: any) {
      console.error('Error inviting member:', error)
      setActionError(error.message)
    }
  }

  const handleViewProjects = async (team: any) => {
    try {
      setSelectedTeam(team)
      const projects = await getTeamProjects(team.id)
      setTeamProjects(projects)
      setProjectsDialogOpen(true)
    } catch (error: any) {
      console.error('Error loading projects:', error)
      setActionError('Error al cargar los proyectos del equipo')
    }
  }

  const handleRemoveProject = async (project: any) => {
    setSelectedProject(project)
    setDeleteProjectDialogOpen(true)
  }

  const handleDeleteTeam = async (team: any) => {
    setSelectedTeam(team)
    setDeleteTeamDialogOpen(true)
  }

  const confirmRemoveProject = async () => {
    if (!selectedTeam || !selectedProject) return

    try {
      setActionError(null)
      setSuccessMessage(null)
      
      await removeProjectFromTeam(
        selectedTeam.id, 
        selectedProject.project_id || selectedProject.project?.id || selectedProject.id
      )
      
      const updatedProjects = teamProjects.filter(
        p => (p.project_id || p.project?.id || p.id) !== 
             (selectedProject.project_id || selectedProject.project?.id || selectedProject.id)
      )
      setTeamProjects(updatedProjects)
      
      setDeleteProjectDialogOpen(false)
      setSelectedProject(null)
      setSuccessMessage('✅ Proyecto eliminado del equipo exitosamente!')
    } catch (error: any) {
      console.error('Error removing project from team:', error)
      setActionError(error.message || 'Error al eliminar el proyecto del equipo')
    }
  }

  const confirmDeleteTeam = async () => {
    if (!selectedTeam) return

    try {
      setActionError(null)
      setSuccessMessage(null)
      
      await deleteTeam(selectedTeam.id)
      
      setDeleteTeamDialogOpen(false)
      setSelectedTeam(null)
      setSuccessMessage('✅ Equipo eliminado exitosamente!')
    } catch (error: any) {
      console.error('Error deleting team:', error)
      setActionError(error.message || 'Error al eliminar el equipo')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3 text-yellow-500" />
      case 'admin': return <Shield className="h-3 w-3 text-blue-500" />
      default: return <User className="h-3 w-3 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'edit': return 'bg-green-100 text-green-800 border-green-200'
      case 'comment': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // CORREGIDO: Verificar si el usuario actual es owner del equipo
  const canDeleteTeam = (team: any) => {
  if (!user || !team) return false
  
  console.log('🔍 Debug canDeleteTeam:', {
    teamName: team.name,
    userId: user.id,
    teamCreatedBy: team.created_by,
    userMembers: team.members?.filter((m: any) => m.user_id === user.id),
    allMembers: team.members
  })
  
  // Verificación 1: ¿Es el usuario el creador del equipo?
  const isCreator = team.created_by === user.id
  console.log('✅ Is creator:', isCreator)
  
  // Verificación 2: ¿Tiene el usuario rol de owner en los miembros?
  const userMember = team.members?.find((member: any) => 
    member.user_id === user.id && member.role === 'owner'
  )
  console.log('✅ Has owner role:', !!userMember)
  
  const canDelete = isCreator || !!userMember
  console.log('🎯 Final canDelete result:', canDelete)
  
  return canDelete
}

  // Verificar si el usuario actual es owner o admin del equipo seleccionado para proyectos
  const canManageProjects = selectedTeam && user && (
    selectedTeam.created_by === user.id || 
    selectedTeam.members?.some((member: any) => 
      member.user_id === user.id && (member.role === 'owner' || member.role === 'admin')
    )
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando equipos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equipos - StackFlow</h1>
              <p className="text-gray-600">Gestiona tus equipos y colaboradores</p>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Equipo
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error al cargar equipos: {error}
                </AlertDescription>
              </Alert>
            )}

            {actionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {actionError}
                </AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {teams.length === 0 && !error ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay equipos</h3>
                  <p className="text-gray-600 mb-4">Crea tu primer equipo para comenzar a colaborar en StackFlow</p>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Equipo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="teams" className="space-y-6">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="teams" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Mis Equipos ({teams.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    Todos los Equipos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="teams">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                      <Card key={team.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-lg">
                            <span className="truncate">{team.name}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                                <Users className="h-3 w-3" />
                                {team.members?.length || 0}
                              </Badge>
                              {canDeleteTeam(team) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTeam(team)}
                                  className="h-6 w-6 p-0 hover:bg-red-50"
                                  title="Eliminar equipo"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </CardTitle>
                          <CardDescription className="truncate">
                            {team.description || 'Sin descripción'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="text-sm">
                              <div className="font-semibold text-gray-700 mb-2">Miembros:</div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {team.members?.slice(0, 5).map((member) => (
                                  <div key={member.id} className="flex items-center justify-between py-1">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1">
                                        {getRoleIcon(member.role)}
                                        <span className="text-sm font-medium truncate max-w-[120px]">
                                          {member.user?.full_name || member.user?.email}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className={`text-xs ${getRoleColor(member.role)}`}>
                                        {member.role}
                                      </Badge>
                                      {member.role !== 'owner' && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeMember(team.id, member.id)}
                                          className="h-6 w-6 p-0 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {team.members && team.members.length > 5 && (
                                  <div className="text-xs text-gray-500 text-center">
                                    +{team.members.length - 5} miembros más
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewProjects(team)}
                                variant="outline"
                                className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                              >
                                <Folder className="h-4 w-4 mr-2" />
                                Proyectos
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTeam(team)
                                  setInviteDialogOpen(true)
                                }}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Invitar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="all">
                  <div className="bg-white rounded-lg border">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Todos los Equipos de StackFlow</h3>
                      <div className="space-y-4">
                        {teams.map((team) => (
                          <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{team.name}</h4>
                                <p className="text-sm text-gray-600">{team.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {team.members?.length || 0} miembros
                              </Badge>
                              {canDeleteTeam(team) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTeam(team)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                  title="Eliminar equipo"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>

      {/* Diálogos existentes (sin cambios) */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Equipo</DialogTitle>
            <DialogDescription>
              Crea un nuevo equipo para colaborar en proyectos de StackFlow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre del equipo *</label>
              <Input
                placeholder="Ej: Equipo de Desarrollo Frontend"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <Input
                placeholder="Ej: Equipo encargado del desarrollo de la interfaz de usuario"
                value={newTeam.description}
                onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTeam} 
              disabled={!newTeam.name.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar al Equipo</DialogTitle>
            <DialogDescription>
              Invita a un colaborador al equipo <strong>{selectedTeam?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email del usuario *</label>
              <Input
                type="email"
                placeholder="usuario@stackflow.com"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                El usuario debe estar registrado en StackFlow
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rol en el equipo</label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Miembro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleInviteMember} 
              disabled={!inviteData.email.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={projectsDialogOpen} onOpenChange={setProjectsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Proyectos del Equipo</DialogTitle>
            <DialogDescription>
              Proyectos compartidos con <strong>{selectedTeam?.name}</strong>
              {canManageProjects && (
                <span className="text-purple-600 ml-2">(Puedes gestionar proyectos)</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {teamProjects.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold mb-2">No hay proyectos</h4>
                <p className="text-gray-600">Este equipo no tiene acceso a ningún proyecto aún.</p>
              </div>
            ) : (
              teamProjects.map((item) => (
                <Card key={item.project_id || item.project?.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.project?.name || 'Proyecto sin nombre'}</h4>
                        <p className="text-sm text-gray-600">
                          {item.project?.description || 'Sin descripción'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={getAccessLevelColor(item.access_level)}>
                          {item.access_level || 'view'}
                        </Badge>
                        {canManageProjects && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProject(item)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            title="Eliminar proyecto del equipo"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteProjectDialogOpen} onOpenChange={setDeleteProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto del Equipo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el proyecto{' '}
              <strong>{selectedProject?.project?.name || 'este proyecto'}</strong>{' '}
              del equipo <strong>{selectedTeam?.name}</strong>?
              <br />
              <span className="text-red-600 font-semibold">
                Esta acción no se puede deshacer. El equipo perderá acceso al proyecto.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteProjectDialogOpen(false)
                setSelectedProject(null)
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRemoveProject}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar equipo - CORREGIDO */}
      <Dialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Equipo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el equipo{' '}
              <strong>{selectedTeam?.name}</strong>?
              <br />
              <span className="text-red-600 font-semibold">
                Esta acción no se puede deshacer. Se perderán todos los datos del equipo,
                incluyendo miembros y accesos a proyectos.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteTeamDialogOpen(false)
                setSelectedTeam(null)
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteTeam}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  )
  // Agrega esto temporalmente para debug
console.log('Debug team data:', {
  team: selectedTeam,
  user: user,
  canDelete: canDeleteTeam(selectedTeam),
  createdBy: selectedTeam?.created_by,
  userMembers: selectedTeam?.members?.filter((m: any) => m.user_id === user?.id)
})
}
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { DashboardSidebar } from '../../../components/DashboardSidebar'
import { Team, TeamMember, User, Project } from '../../../types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  UserPlus, 
  Folder, 
  Settings, 
  Mail, 
  Trash2,
  ArrowLeft,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react'

export default function TeamManagementPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    checkUser()
    fetchTeamData()
  }, [teamId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser({ id: user.id, email: user.email! })
  }

  const fetchTeamData = async () => {
    try {
      console.log('🔄 Cargando datos del equipo...', teamId)

      // Fetch team details
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError

      // Fetch team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)

      if (membersError) throw membersError

      // Usar placeholders para emails
      const membersWithPlaceholder = (membersData || []).map(member => ({
        ...member,
        user: {
          email: `user-${member.user_id.substring(0, 8)}@example.com`
        }
      }))

      // Fetch projects assigned to this team
      const { data: projectsData, error: projectsError } = await supabase
        .from('project_teams')
        .select(`
          *,
          project:projects (*)
        `)
        .eq('team_id', teamId)

      if (projectsError) throw projectsError

      // Fetch all available projects for assignment
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (allProjectsError) throw allProjectsError

      setTeam(teamData)
      setMembers(membersWithPlaceholder)
      setProjects(projectsData?.map(pt => pt.project) || [])
      setAvailableProjects(allProjects?.filter(p => 
        !projectsData?.some(pt => pt.project_id === p.id)
      ) || [])

      console.log('✅ Datos del equipo cargados')

    } catch (error) {
      console.error('💥 Error cargando datos del equipo:', error)
      // Usar datos de ejemplo en caso de error
      setTeam({
        id: teamId,
        name: 'Equipo de Ejemplo',
        description: 'Este es un equipo de ejemplo',
        created_by: user?.id || 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setMembers([
        {
          id: 'mock-member-1',
          team_id: teamId,
          user_id: user?.id || 'mock-user',
          role: 'owner',
          joined_at: new Date().toISOString(),
          user: { email: user?.email || 'owner@example.com' }
        }
      ])
      setProjects([])
      setAvailableProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      alert('Por favor ingresa un email')
      return
    }

    try {
      // En una implementación real, aquí buscarías el usuario por email
      // Por ahora, crearemos un miembro mock
      const mockMember: TeamMember = {
        id: `mock-${Date.now()}`,
        team_id: teamId,
        user_id: `user-${Date.now()}`,
        role: 'member',
        joined_at: new Date().toISOString(),
        user: { email: inviteEmail.trim() }
      }

      // En una implementación real, harías:
      // const { error } = await supabase.from('team_members').insert([...])
      // Por ahora, simulamos la inserción
      
      setMembers([...members, mockMember])
      setInviteEmail('')
      alert(`Usuario ${inviteEmail} agregado al equipo exitosamente (simulado)`)

    } catch (error) {
      console.error('❌ Error invitando miembro:', error)
      alert('Error al agregar el usuario al equipo')
    }
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${memberEmail} del equipo?`)) return

    try {
      // En una implementación real:
      // const { error } = await supabase.from('team_members').delete().eq('id', memberId)
      
      // Simulamos la eliminación
      setMembers(members.filter(member => member.id !== memberId))
      alert('Miembro eliminado del equipo (simulado)')

    } catch (error) {
      console.error('❌ Error eliminando miembro:', error)
      alert('Error al eliminar el miembro del equipo')
    }
  }

  const handleAssignProject = async (projectId: string) => {
    try {
      // En una implementación real:
      // const { error } = await supabase.from('project_teams').insert([...])
      
      // Simulamos la asignación
      const projectToAssign = availableProjects.find(p => p.id === projectId)
      if (projectToAssign) {
        setProjects([...projects, projectToAssign])
        setAvailableProjects(availableProjects.filter(p => p.id !== projectId))
        alert('Proyecto asignado al equipo exitosamente (simulado)')
      }

    } catch (error) {
      console.error('❌ Error asignando proyecto:', error)
      alert('Error al asignar el proyecto al equipo')
    }
  }

  const handleRemoveProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover este proyecto del equipo?')) return

    try {
      // En una implementación real:
      // const { error } = await supabase.from('project_teams').delete().eq('project_id', projectId).eq('team_id', teamId)
      
      // Simulamos la remoción
      const projectToRemove = projects.find(p => p.id === projectId)
      if (projectToRemove) {
        setProjects(projects.filter(p => p.id !== projectId))
        setAvailableProjects([...availableProjects, projectToRemove])
        alert('Proyecto removido del equipo (simulado)')
      }

    } catch (error) {
      console.error('❌ Error removiendo proyecto:', error)
      alert('Error al remover el proyecto del equipo')
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'bg-purple-100 text-purple-700 border-purple-200',
      admin: 'bg-blue-100 text-blue-700 border-blue-200',
      member: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return variants[role as keyof typeof variants] || variants.member
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: 'Propietario',
      admin: 'Administrador',
      member: 'Miembro'
    }
    return labels[role as keyof typeof labels] || role
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando equipo...</div>
        </div>
      </div>
    )
  }

  if (!user || !team) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Equipo no encontrado</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <DashboardSidebar user={user} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/teams')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a equipos</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <p className="text-gray-600">{team.description || 'Sin descripción'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Miembros ({members.length})</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center space-x-2">
                  <Folder className="h-4 w-4" />
                  <span>Proyectos ({projects.length})</span>
                </TabsTrigger>
              </TabsList>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6">
                {/* Invite Member Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserPlus className="h-5 w-5" />
                      <span>Agregar Miembro</span>
                    </CardTitle>
                    <CardDescription>
                      Invita a un usuario existente a unirse al equipo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Email del usuario"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleInviteMember()
                        }}
                      />
                      <Button 
                        onClick={handleInviteMember}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Invitar
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Nota: Esta es una simulación. En producción se buscaría el usuario real.
                    </p>
                  </CardContent>
                </Card>

                {/* Members List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Miembros del Equipo</CardTitle>
                    <CardDescription>
                      Gestiona los miembros y sus roles en el equipo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-medium text-purple-600">
                                {member.user?.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.user?.email}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className={getRoleBadge(member.role)}>
                                  <Shield className="h-3 w-3 mr-1" />
                                  {getRoleLabel(member.role)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Unido el {new Date(member.joined_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {member.role !== 'owner' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id, member.user?.email || '')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {members.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No hay miembros en este equipo</p>
                          <p className="text-sm mt-1">Agrega el primer miembro usando el formulario arriba</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                {/* Assign Project Card */}
                {availableProjects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Folder className="h-5 w-5" />
                        <span>Asignar Proyecto</span>
                      </CardTitle>
                      <CardDescription>
                        Asigna proyectos existentes a este equipo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {availableProjects.map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {project.description || 'Sin descripción'}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  Creado el {new Date(project.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAssignProject(project.id)}
                              className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Asignar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Assigned Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle>Proyectos Asignados</CardTitle>
                    <CardDescription>
                      Proyectos en los que este equipo tiene acceso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {projects.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No hay proyectos asignados a este equipo</p>
                        <p className="text-sm mt-1">
                          {availableProjects.length > 0 
                            ? 'Usa el formulario arriba para asignar proyectos' 
                            : 'No hay proyectos disponibles para asignar'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {project.description || 'Sin descripción'}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                  Acceso: Ver
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Creado el {new Date(project.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProject(project.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* No Projects Available */}
                {availableProjects.length === 0 && projects.length === 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center text-gray-500">
                        <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No hay proyectos disponibles</p>
                        <p className="text-sm mt-1">Crea algunos proyectos primero para poder asignarlos a equipos</p>
                        <Button 
                          onClick={() => router.push('/projects')}
                          className="mt-4 bg-purple-600 hover:bg-purple-700"
                        >
                          Ir a Proyectos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
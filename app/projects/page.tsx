'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import ProjectCard from '../../components/ProjectCard'
import ProjectForm from '../../components/ProjectForm'
import { ShareProjectDialog } from '../../components/ShareProjectDialog'
import { Project, User } from '../../types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Folder, Filter, Users, Shield } from 'lucide-react'

export default function ProjectsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchProjects()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser({ id: user.id, email: user.email! })
  }

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log('🔄 Buscando proyectos para usuario:', user.id)

      // ✅ CONSULTA SIMPLIFICADA - SIN RELACIONES PROBLEMÁTICAS
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching projects:', error)
        
        // Si todavía hay error, intentar una consulta más básica
        if (error.code === '42P17') {
          console.log('🔄 Intentando consulta alternativa...')
          const { data: altData, error: altError } = await supabase
            .from('projects')
            .select('id, name, description, created_by, created_at, updated_at')
            .order('created_at', { ascending: false })
            
          if (!altError) {
            setProjects(altData || [])
            return
          }
        }
      } else {
        console.log('✅ Proyectos cargados:', data)
        setProjects(data || [])
      }
    } catch (error) {
      console.error('💥 Error in fetchProjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (projectData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Usuario no autenticado')
      return
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          ...projectData, 
          created_by: user.id,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating project:', error)
        
        if (error.code === '42501') {
          alert('No tienes permisos para crear proyectos')
        } else if (error.code === '23505') {
          alert('Ya existe un proyecto con ese nombre')
        } else {
          alert('Error al crear el proyecto: ' + error.message)
        }
      } else {
        console.log('✅ Proyecto creado:', data)
        setProjects([data, ...projects])
        setShowForm(false)
        
        // ❌ NO compartir automáticamente con equipos
        // El proyecto será PRIVADO por defecto
        
        alert('Proyecto creado exitosamente')
      }
    } catch (error) {
      console.error('💥 Error in handleCreateProject:', error)
      alert('Error inesperado al crear el proyecto')
    }
  }

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Usuario no autenticado')
      return
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...projectData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProject.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating project:', error)
        
        if (error.code === '42501') {
          alert('No tienes permisos para editar este proyecto')
        } else {
          alert('Error al actualizar el proyecto: ' + error.message)
        }
      } else {
        console.log('✅ Proyecto actualizado:', data)
        setProjects(projects.map(p => p.id === editingProject.id ? data : p))
        setEditingProject(null)
        alert('Proyecto actualizado exitosamente')
      }
    } catch (error) {
      console.error('💥 Error in handleUpdateProject:', error)
      alert('Error inesperado al actualizar el proyecto')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Usuario no autenticado')
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('❌ Error deleting project:', error)
        
        if (error.code === '42501') {
          alert('No tienes permisos para eliminar este proyecto')
        } else {
          alert('Error al eliminar el proyecto: ' + error.message)
        }
      } else {
        console.log('✅ Proyecto eliminado:', projectId)
        setProjects(projects.filter(p => p.id !== projectId))
        alert('Proyecto eliminado exitosamente')
      }
    } catch (error) {
      console.error('💥 Error in handleDeleteProject:', error)
      alert('Error inesperado al eliminar el proyecto')
    }
  }

  const handleShareProject = (project: Project) => {
    setSelectedProject(project)
    setShareDialogOpen(true)
  }

  // Verificar si el usuario es el creador del proyecto
  const isProjectOwner = (project: Project) => {
    return user && project.created_by === user.id
  }

  // Verificar si el proyecto es compartido (no es del usuario actual)
  const isProjectShared = (project: Project) => {
    return !isProjectOwner(project)
  }

  // Obtener información de compartición del proyecto
  const getProjectSharingInfo = (project: Project) => {
    // Para proyectos sin relaciones cargadas, asumir que no están compartidos
    return {
      sharedWithUsers: 0,
      sharedWithTeams: 0,
      totalShares: 0
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Estadísticas para los cards
  const stats = {
    total: projects.length,
    owned: projects.filter(p => isProjectOwner(p)).length,
    shared: projects.filter(p => !isProjectOwner(p)).length,
    paused: projects.filter(p => p.description?.toLowerCase().includes('pausa')).length
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando proyectos...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">No autenticado</div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
              <p className="text-gray-600">Gestiona y organiza todos tus proyectos</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search and Filters */}
            <Card className="border-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar proyectos por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 focus:ring-purple-500"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Form */}
            {(showForm || editingProject) && (
              <ProjectForm
                project={editingProject}
                onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
                onCancel={() => {
                  setShowForm(false)
                  setEditingProject(null)
                }}
              />
            )}

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <Card className="border-purple-100 text-center py-12">
                <CardContent>
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos creados'}
                  </CardTitle>
                  <CardDescription className="mb-6">
                    {searchTerm 
                      ? 'Intenta con otros términos de búsqueda' 
                      : 'Comienza creando tu primer proyecto para organizar tu trabajo'
                    }
                  </CardDescription>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primer proyecto
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                          <div className="text-sm text-purple-700">Total Proyectos</div>
                        </div>
                        <Folder className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{stats.owned}</div>
                          <div className="text-sm text-blue-700">Mis Proyectos</div>
                        </div>
                        <Shield className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{stats.shared}</div>
                          <div className="text-sm text-green-700">Compartidos</div>
                        </div>
                        <Users className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
                          <div className="text-sm text-orange-700">En pausa</div>
                        </div>
                        <Filter className="h-8 w-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projects Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {searchTerm ? `Resultados (${filteredProjects.length})` : 'Todos los proyectos'}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Badge variant="outline" className="bg-white">
                      {stats.owned} propios
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {stats.shared} compartidos
                    </Badge>
                  </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => {
                    const isOwner = isProjectOwner(project)
                    const isShared = isProjectShared(project)
                    
                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={setEditingProject}
                        onDelete={handleDeleteProject}
                        onShare={handleShareProject}
                        canEdit={isOwner}
                        canDelete={isOwner}
                        canShare={isOwner}
                        isShared={isShared}
                        sharingInfo={getProjectSharingInfo(project)}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Share Project Dialog */}
      <ShareProjectDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        project={selectedProject}
        onProjectShared={fetchProjects}
      />
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import { KanbanBoard } from '../../components/KanbanBoard'
import { CreateIssueDialog } from '../../components/CreateIssueDialog'
import { Issue, User, Project } from '../../types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, LayoutGrid, List, Folder } from 'lucide-react'

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all') // ✅ Nuevo estado
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchData()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser({ id: user.id, email: user.email! })
  }

  const fetchData = async () => {
    try {
      console.log('🔄 Cargando datos...')
      
      const [issuesResponse, projectsResponse] = await Promise.all([
        supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
      ])

      console.log('📊 Respuesta de issues:', issuesResponse)
      console.log('📁 Respuesta de projects:', projectsResponse)

      if (issuesResponse.error) {
        console.error('❌ Error cargando issues:', issuesResponse.error)
        throw issuesResponse.error
      }
      
      if (projectsResponse.error) {
        console.error('❌ Error cargando projects:', projectsResponse.error)
        throw projectsResponse.error
      }

      setIssues(issuesResponse.data || [])
      setProjects(projectsResponse.data || [])
      console.log(`✅ Datos cargados: ${issuesResponse.data?.length || 0} issues, ${projectsResponse.data?.length || 0} proyectos`)
      
    } catch (error) {
      console.error('💥 Error cargando datos:', error)
      alert('Error al cargar los datos. Verifica la consola para más detalles.')
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCreate = async (issueData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    console.log('📝 Creando tarea con datos:', issueData)

    // Validar que tenemos los datos mínimos requeridos
    if (!issueData.title || !issueData.project_id) {
      alert('El título y el proyecto son requeridos')
      return
    }

    try {
      const { data, error } = await supabase
        .from('issues')
        .insert([{ 
          title: issueData.title,
          description: issueData.description || null,
          status: issueData.status || 'todo',
          priority: issueData.priority || 'medium',
          project_id: issueData.project_id,
          created_by: user.id 
        }])
        .select()

      if (error) {
        console.error('❌ Error creando tarea:', error)
        alert(`Error al crear la tarea: ${error.message}`)
      } else if (data) {
        console.log('✅ Tarea creada exitosamente:', data[0])
        setIssues([data[0], ...issues])
        setCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('💥 Error inesperado:', error)
      alert('Error inesperado al crear la tarea')
    }
  }

  const handleIssueUpdate = async (issueId: string, updates: any) => {
    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', issueId)
      .select()

    if (error) {
      console.error('Error updating issue:', error)
      alert('Error al actualizar la tarea')
    } else {
      setIssues(issues.map(issue => issue.id === issueId ? data[0] : issue))
    }
  }

  const handleIssueDelete = async (issueId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return

    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', issueId)

    if (error) {
      console.error('Error deleting issue:', error)
      alert('Error al eliminar la tarea')
    } else {
      setIssues(issues.filter(issue => issue.id !== issueId))
    }
  }

  // ✅ Filtrar tareas por proyecto y búsqueda
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProject = 
      selectedProject === 'all' || 
      issue.project_id === selectedProject
    
    return matchesSearch && matchesProject
  })

  // ✅ Obtener el proyecto seleccionado
  const getSelectedProject = () => {
    if (selectedProject === 'all') return null
    return projects.find(project => project.id === selectedProject)
  }

  const selectedProjectData = getSelectedProject()

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando tareas...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedProjectData ? `Tareas - ${selectedProjectData.name}` : 'Tareas'}
              </h1>
              <p className="text-gray-600">
                {selectedProjectData 
                  ? `Gestionando tareas del proyecto ${selectedProjectData.name}`
                  : 'Gestiona y organiza todas las tareas del equipo'
                }
              </p>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={projects.length === 0} // ✅ Deshabilitar si no hay proyectos
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats and Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Stats */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedProject === 'all' 
                      ? issues.length 
                      : issues.filter(issue => issue.project_id === selectedProject).length
                    }
                  </div>
                  <div className="text-sm text-purple-700">Total Tareas</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredIssues.filter(i => i.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-blue-700">En Progreso</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredIssues.filter(i => i.status === 'review').length}
                  </div>
                  <div className="text-sm text-yellow-700">En Revisión</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredIssues.filter(i => i.status === 'done').length}
                  </div>
                  <div className="text-sm text-green-700">Completadas</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="border-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Selector de proyectos */}
                  <div className="w-64">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger className="focus:ring-purple-500">
                        <Folder className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los proyectos</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Búsqueda */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={
                        selectedProjectData 
                          ? `Buscar en ${selectedProjectData.name}...`
                          : "Buscar en todas las tareas..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Vista */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={viewMode === 'kanban' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('kanban')}
                      className={viewMode === 'kanban' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Kanban
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Lista
                    </Button>
                  </div>

                  <Button variant="outline" className="border-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Diálogo para crear tareas */}
            <CreateIssueDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              projects={projects}
              defaultStatus="todo"
              defaultProjectId={selectedProject !== 'all' ? selectedProject : undefined} // ✅ Proyecto por defecto
              onSubmit={handleIssueCreate}
            />

            {/* Content */}
            {filteredIssues.length === 0 ? (
              <Card className="border-purple-100 text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">📋</div>
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm 
                      ? 'No se encontraron tareas' 
                      : selectedProjectData
                        ? `No hay tareas en ${selectedProjectData.name}`
                        : 'No hay tareas creadas'
                    }
                  </CardTitle>
                  <CardDescription className="mb-6">
                    {searchTerm 
                      ? 'Intenta con otros términos de búsqueda' 
                      : selectedProjectData
                        ? `Comienza creando la primera tarea para el proyecto ${selectedProjectData.name}`
                        : 'Comienza creando tu primera tarea para organizar el trabajo'
                    }
                  </CardDescription>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setCreateDialogOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={projects.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {selectedProjectData ? 'Crear tarea en este proyecto' : 'Crear primera tarea'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <KanbanBoard
                issues={filteredIssues}
                projects={projects}
                onIssueCreate={handleIssueCreate}
                onIssueUpdate={handleIssueUpdate}
                onIssueDelete={handleIssueDelete}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
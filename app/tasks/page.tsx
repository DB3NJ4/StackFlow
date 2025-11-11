'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import { KanbanBoard } from '../../components/KanbanBoard'
import { IssuesList } from '../../components/IssuesList'
import { CreateIssueDialog } from '../../components/CreateIssueDialog'
import { Issue, User, Project, IssueStatus, IssuePriority } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, LayoutGrid, List, Folder, X } from 'lucide-react'

export default function TasksPage() {
  const [user, setUser] = useState<User | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      console.log('👤 Usuario actual:', user.id)

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

      // ✅ FILTRAR ISSUES VÁLIDOS
      const validIssues = (issuesResponse.data || []).filter(issue => 
        issue && 
        typeof issue === 'object' && 
        issue.id && 
        issue.title && 
        typeof issue.title === 'string'
      )

      // Log para debugging de permisos
      console.log(`📈 Estadísticas de carga:`, {
        issuesTotales: issuesResponse.data?.length || 0,
        issuesValidos: validIssues.length,
        proyectos: projectsResponse.data?.length || 0,
        usuario: user.id
      })

      setIssues(validIssues)
      setProjects(projectsResponse.data || [])
      console.log(`✅ Datos cargados: ${validIssues.length} issues, ${projectsResponse.data?.length || 0} proyectos`)
      
    } catch (error) {
      console.error('💥 Error cargando datos:', error)
      alert('Error al cargar los datos. Verifica la consola para más detalles.')
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCreate = async (issueData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Usuario no autenticado')
      return
    }

    console.log('📝 Creando tarea con datos:', issueData)
    console.log('👤 Usuario creador:', user.id)

    // Validar que tenemos los datos mínimos requeridos
    if (!issueData.title || !issueData.project_id) {
      alert('El título y el proyecto son requeridos')
      return
    }

    // Verificar que el usuario puede crear issues en este proyecto
    const targetProject = projects.find(p => p.id === issueData.project_id)
    if (!targetProject) {
      alert('Proyecto no encontrado')
      return
    }

    if (targetProject.created_by !== user.id) {
      alert('No tienes permisos para crear tareas en este proyecto')
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
      } else if (data && data[0]) {
        console.log('✅ Tarea creada exitosamente:', data[0])
        setIssues(prevIssues => {
          const validPrevIssues = prevIssues.filter(issue => 
            issue && typeof issue === 'object' && issue.id
          )
          return [data[0], ...validPrevIssues]
        })
        setCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('💥 Error inesperado:', error)
      alert('Error inesperado al crear la tarea')
    }
  }

  const handleIssueUpdate = async (issueId: string, updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('❌ Usuario no autenticado')
        return
      }

      console.log('🔄 Actualizando tarea:', issueId, updates)
      console.log('👤 Usuario:', user.id)

      // Verificar que el issue existe y tenemos permisos
      const issueToUpdate = issues.find(issue => issue.id === issueId)
      if (!issueToUpdate) {
        console.error('❌ Tarea no encontrada:', issueId)
        alert('Tarea no encontrada')
        return
      }

      console.log('🔍 Tarea a actualizar:', {
        id: issueToUpdate.id,
        title: issueToUpdate.title,
        created_by: issueToUpdate.created_by,
        assigned_to: issueToUpdate.assigned_to,
        project_id: issueToUpdate.project_id
      })

      // Verificar permisos según tus políticas RLS
      const userCanUpdate = 
        issueToUpdate.created_by === user.id ||
        issueToUpdate.assigned_to === user.id ||
        projects.some(project => 
          project.id === issueToUpdate.project_id && 
          project.created_by === user.id
        )

      if (!userCanUpdate) {
        console.error('🚫 Sin permisos para actualizar:', {
          usuario: user.id,
          creador: issueToUpdate.created_by,
          asignado: issueToUpdate.assigned_to,
          proyecto: issueToUpdate.project_id
        })
        alert('No tienes permisos para actualizar esta tarea')
        return
      }

      console.log('✅ Permisos verificados - Procediendo con actualización')

      // 1. Actualizar estado local inmediatamente (mejor UX)
      setIssues(prevIssues => {
        const validIssues = prevIssues.filter(issue => 
          issue && typeof issue === 'object' && issue.id
        )
        
        return validIssues.map(issue => {
          if (!issue || !issue.id) return issue
          if (issue.id === issueId) {
            return { 
              ...issue, 
              ...updates, 
              updated_at: new Date().toISOString() 
            }
          }
          return issue
        })
      })

      console.log('✅ Estado local actualizado')

      // 2. Actualizar en Supabase
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId)
        .select('*')

      if (error) {
        console.error('❌ Error en Supabase:', error)
        
        // Revertir cambios locales si falla en Supabase
        setIssues(prevIssues => {
          const validIssues = prevIssues.filter(issue => 
            issue && typeof issue === 'object' && issue.id
          )
          
          return validIssues.map(issue => {
            if (!issue || !issue.id) return issue
            if (issue.id === issueId) {
              return issueToUpdate // Volver al estado original
            }
            return issue
          })
        })
        
        alert(`Error al guardar en la base de datos: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        console.log('✅ Supabase retornó datos actualizados:', data[0])
        
        // Sincronizar con datos frescos de Supabase
        setIssues(prevIssues => {
          const validIssues = prevIssues.filter(issue => 
            issue && typeof issue === 'object' && issue.id
          )
          
          return validIssues.map(issue => {
            if (!issue || !issue.id) return issue
            return issue.id === issueId ? data[0] : issue
          })
        })
      } else {
        console.log('ℹ️ Supabase no retornó datos, pero la actualización fue exitosa')
      }

      console.log('🎉 Actualización completada exitosamente')
      
    } catch (error) {
      console.error('💥 Error inesperado al actualizar:', error)
      alert('Error inesperado al actualizar la tarea')
    }
  }

  const handleIssueDelete = async (issueId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return

    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId)

      if (error) {
        console.error('❌ Error eliminando tarea:', error)
        alert('Error al eliminar la tarea')
      } else {
        setIssues(prevIssues => {
          const validIssues = prevIssues.filter(issue => 
            issue && typeof issue === 'object' && issue.id
          )
          return validIssues.filter(issue => issue.id !== issueId)
        })
        console.log('✅ Tarea eliminada exitosamente')
      }
    } catch (error) {
      console.error('💥 Error inesperado al eliminar:', error)
      alert('Error inesperado al eliminar la tarea')
    }
  }

  // ✅ FILTRAR TAREAS CON TODOS LOS FILTROS
  const filteredIssues = issues.filter(issue => {
    if (!issue || typeof issue !== 'object' || !issue.title || typeof issue.title !== 'string') {
      return false
    }

    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.description && typeof issue.description === 'string' 
        ? issue.description.toLowerCase().includes(searchTerm.toLowerCase())
        : false)
    
    const matchesProject = 
      selectedProject === 'all' || 
      issue.project_id === selectedProject

    const matchesStatus = 
      selectedStatus === 'all' || 
      issue.status === selectedStatus

    const matchesPriority = 
      selectedPriority === 'all' || 
      issue.priority === selectedPriority
    
    return matchesSearch && matchesProject && matchesStatus && matchesPriority
  })

  // ✅ OBTENER EL PROYECTO SELECCIONADO
  const getSelectedProject = () => {
    if (selectedProject === 'all') return null
    return projects.find(project => project.id === selectedProject)
  }

  // ✅ LIMPIAR FILTROS
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedProject('all')
    setSelectedStatus('all')
    setSelectedPriority('all')
  }

  // ✅ CONTAR FILTROS ACTIVOS
  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedProject !== 'all' ? 1 : 0,
    selectedStatus !== 'all' ? 1 : 0,
    selectedPriority !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0)

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
      <DashboardSidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedProjectData ? `Tareas - ${selectedProjectData.name}` : 'Tareas'}
              </h1>
              <p className="text-gray-600">
                {user.email} • {projects.length} proyectos • {issues.length} tareas visibles
              </p>
            </div>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={projects.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats and Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedProject === 'all' ? issues.length : issues.filter(issue => issue.project_id === selectedProject).length}
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
                        <SelectValue placeholder="Todos los proyectos" />
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

                  <Button 
                    variant="outline" 
                    className="border-gray-300 relative"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-purple-600 text-white">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>

                {/* Filtros expandibles */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Estado</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="todo">Por Hacer</SelectItem>
                          <SelectItem value="in_progress">En Progreso</SelectItem>
                          <SelectItem value="review">En Revisión</SelectItem>
                          <SelectItem value="done">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Prioridad</Label>
                      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las prioridades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las prioridades</SelectItem>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diálogo para crear tareas */}
            <CreateIssueDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              projects={projects}
              defaultStatus="todo"
              defaultProjectId={selectedProject !== 'all' ? selectedProject : undefined}
              onSubmit={handleIssueCreate}
            />

            {/* Content */}
            {filteredIssues.length === 0 ? (
              <Card className="border-purple-100 text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">📋</div>
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                      ? 'No se encontraron tareas con los filtros aplicados' 
                      : selectedProjectData
                        ? `No hay tareas en ${selectedProjectData.name}`
                        : 'No hay tareas creadas'
                    }
                  </CardTitle>
                  <CardDescription className="mb-6">
                    {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda' 
                      : selectedProjectData
                        ? `Comienza creando la primera tarea para el proyecto ${selectedProjectData.name}`
                        : 'Comienza creando tu primera tarea para organizar el trabajo'
                    }
                  </CardDescription>
                  {(searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') ? (
                    <Button onClick={clearFilters} variant="outline">
                      Limpiar filtros
                    </Button>
                  ) : (
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
            ) : viewMode === 'kanban' ? (
              <KanbanBoard
                issues={filteredIssues}
                projects={projects}
                onIssueCreate={handleIssueCreate}
                onIssueUpdate={handleIssueUpdate}
                onIssueDelete={handleIssueDelete}
              />
            ) : (
              <IssuesList
                issues={filteredIssues}
                projects={projects}
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
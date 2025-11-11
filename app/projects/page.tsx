'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import ProjectCard from '../../components/ProjectCard'
import ProjectForm from '../../components/ProjectForm'
import { Project, User } from '../../types'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Folder, Filter } from 'lucide-react'

export default function ProjectsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  const handleCreateProject = async (projectData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, created_by: user.id }])
      .select()

    if (error) {
      console.error('Error creating project:', error)
      alert('Error al crear el proyecto')
    } else {
      setProjects([data[0], ...projects])
      setShowForm(false)
    }
  }

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return

    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', editingProject.id)
      .select()

    if (error) {
      console.error('Error updating project:', error)
      alert('Error al actualizar el proyecto')
    } else {
      setProjects(projects.map(p => p.id === editingProject.id ? data[0] : p))
      setEditingProject(null)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto')
    } else {
      setProjects(projects.filter(p => p.id !== projectId))
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                      placeholder="Buscar proyectos..."
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
                      <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
                      <div className="text-sm text-purple-700">Total Proyectos</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                      <div className="text-sm text-blue-700">Activos</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-green-700">Completados</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-sm text-orange-700">En pausa</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={setEditingProject}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
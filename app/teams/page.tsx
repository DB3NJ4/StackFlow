'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '../../components/DashboardSidebar'
import { TeamsList } from '../../components/TeamsList'
import { TeamFormDialog } from '../../components/TeamFormDialog'
import { Team, User } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus } from 'lucide-react'

export default function TeamsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [teamFormOpen, setTeamFormOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchTeams()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser({ id: user.id, email: user.email! })
  }

  const fetchTeams = async () => {
    try {
      console.log('🔄 Cargando equipos...')
      
      // Obtener equipos básicos - SIN miembros por ahora
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })

      if (teamsError) throw teamsError

      // Para desarrollo, crear datos de ejemplo sin consultar team_members
      const teamsWithMockData = await Promise.all(
        (teamsData || []).map(async (team) => {
          // Mock data para desarrollo
          const mockMembers = [
            {
              id: 'mock-member-1',
              team_id: team.id,
              user_id: team.created_by,
              role: 'owner' as const,
              joined_at: team.created_at,
              user: {
                email: user?.email || 'owner@example.com'
              }
            }
          ]

          // Contar proyectos por equipo
          const { count } = await supabase
            .from('project_teams')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)

          return {
            ...team,
            members: mockMembers, // Usar mock data por ahora
            projects_count: count || 0
          }
        })
      )

      setTeams(teamsWithMockData)
      console.log(`✅ Equipos cargados: ${teamsWithMockData.length}`)
      
    } catch (error) {
      console.error('💥 Error cargando equipos:', error)
      // Mostrar equipos de ejemplo si hay error
      setTeams([
        {
          id: 'mock-team-1',
          name: 'Equipo de Desarrollo',
          description: 'Equipo encargado del desarrollo de features',
          created_by: user?.id || 'mock-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          members: [
            {
              id: 'mock-member-1',
              team_id: 'mock-team-1',
              user_id: 'mock-user',
              role: 'owner',
              joined_at: new Date().toISOString(),
              user: { email: user?.email || 'admin@example.com' }
            }
          ],
          projects_count: 2
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTeamCreate = async (teamData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ 
          ...teamData,
          created_by: user.id 
        }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        // Agregar al creador como owner del equipo
        await supabase
          .from('team_members')
          .insert([{
            team_id: data[0].id,
            user_id: user.id,
            role: 'owner'
          }])

        // Recargar los equipos
        await fetchTeams()
        setTeamFormOpen(false)
        alert('Equipo creado exitosamente')
      }
    } catch (error) {
      console.error('❌ Error creando equipo:', error)
      alert('Error al crear el equipo')
    }
  }

  const handleTeamUpdate = async (teamData: any) => {
    if (!editingTeam) return

    try {
      const { data, error } = await supabase
        .from('teams')
        .update(teamData)
        .eq('id', editingTeam.id)
        .select()

      if (error) throw error

      setTeams(teams.map(team => 
        team.id === editingTeam.id 
          ? { ...data[0], members: editingTeam.members, projects_count: editingTeam.projects_count } 
          : team
      ))
      setEditingTeam(null)
      alert('Equipo actualizado exitosamente')
    } catch (error) {
      console.error('❌ Error actualizando equipo:', error)
      alert('Error al actualizar el equipo')
    }
  }

  const handleTeamDelete = async (teamId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) return

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      setTeams(teams.filter(team => team.id !== teamId))
      alert('Equipo eliminado exitosamente')
    } catch (error) {
      console.error('❌ Error eliminando equipo:', error)
      alert('Error al eliminar el equipo')
    }
  }

  const handleTeamManage = (team: Team) => {
    router.push(`/teams/${team.id}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Cargando equipos...</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>
              <p className="text-gray-600">Gestiona equipos y colaboración en proyectos</p>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <TeamsList
              teams={teams}
              onTeamCreate={() => setTeamFormOpen(true)}
              onTeamEdit={setEditingTeam}
              onTeamManage={handleTeamManage}
              onTeamDelete={handleTeamDelete}
            />

            {/* Team Form Dialog */}
            <TeamFormDialog
              open={teamFormOpen || !!editingTeam}
              onOpenChange={(open) => {
                setTeamFormOpen(open)
                if (!open) setEditingTeam(null)
              }}
              team={editingTeam}
              onSubmit={editingTeam ? handleTeamUpdate : handleTeamCreate}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
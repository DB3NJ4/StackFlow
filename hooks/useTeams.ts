import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Team } from '../types'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Consulta simplificada sin la relación con users
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(*)
        `)
        .eq('created_by', user.id)

      if (error) throw error
      
      // Enriquecer los datos con información del usuario desde auth
      const teamsWithUserData = await Promise.all(
        (data || []).map(async (team) => {
          if (team.members && team.members.length > 0) {
            const membersWithEmail = await Promise.all(
              team.members.map(async (member: any) => {
                // Obtener email del usuario desde auth
                const { data: userData } = await supabase.auth.admin.getUserById(member.user_id)
                return {
                  ...member,
                  user: {
                    email: userData?.user?.email || 'Usuario no encontrado'
                  }
                }
              })
            )
            return { ...team, members: membersWithEmail }
          }
          return team
        })
      )

      setTeams(teamsWithUserData)
    } catch (error: any) {
      console.error('Error fetching teams:', error)
      setError(error.message)
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  return {
    teams,
    loading,
    error,
    refreshTeams: fetchTeams
  }
}
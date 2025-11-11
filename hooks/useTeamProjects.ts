import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Project, ProjectTeam } from '../types'

export function useTeamProjects(teamId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (teamId) {
      fetchTeamProjects(teamId)
    }
  }, [teamId])

  const fetchTeamProjects = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_teams')
        .select(`
          project:projects(*)
        `)
        .eq('team_id', teamId)

      if (error) throw error

      const teamProjects = data?.map(item => item.project).filter(Boolean) as Project[]
      setProjects(teamProjects)
    } catch (error) {
      console.error('Error fetching team projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareProjectWithTeam = async (projectId: string, teamId: string, accessLevel: 'view' | 'comment' | 'edit' = 'view') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('project_teams')
        .insert([{
          project_id: projectId,
          team_id: teamId,
          access_level: accessLevel,
          added_by: user.id
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error sharing project:', error)
      throw error
    }
  }

  return {
    projects,
    loading,
    shareProjectWithTeam
  }
}
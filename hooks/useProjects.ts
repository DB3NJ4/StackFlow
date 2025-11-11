
'use client' 

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Project } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      console.log('🔄 [DEBUG] Fetching projects for user:', user.id)
      console.log('👤 [DEBUG] Current user ID:', user.id)

      // Obtener proyectos del usuario y proyectos compartidos con sus equipos
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_teams (
            team_id,
            teams (
              id,
              name,
              team_members (
                user_id,
                role
              )
            )
          )
        `)
        .or(`created_by.eq.${user.id},project_teams.teams.team_members.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching projects:', error)
        throw error
      }

      console.log('📦 [DEBUG] Raw projects data from Supabase:', data)
      
      // Filtrar proyectos duplicados y transformar la estructura
      const uniqueProjects = (data || []).filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      )

      console.log('✅ [DEBUG] Unique projects after filtering:', uniqueProjects)

      // DEBUG: Verificar el owner de cada proyecto
      uniqueProjects.forEach(project => {
        console.log(`🔍 [DEBUG] Project: ${project.name}`, {
          projectId: project.id,
          projectName: project.name,
          createdBy: project.created_by,
          isOwner: project.created_by === user.id,
          currentUserId: user.id,
          hasProjectTeams: project.project_teams?.length || 0,
          projectTeams: project.project_teams?.map(pt => ({
            teamId: pt.team_id,
            teamName: pt.teams?.name,
            members: pt.teams?.team_members?.map(m => ({
              userId: m.user_id,
              role: m.role,
              isCurrentUser: m.user_id === user.id
            }))
          }))
        })
      })

      // Contar proyectos por tipo
      const ownedProjects = uniqueProjects.filter(p => p.created_by === user.id)
      const sharedProjects = uniqueProjects.filter(p => p.created_by !== user.id)
      
      console.log('📊 [DEBUG] Projects summary:', {
        total: uniqueProjects.length,
        owned: ownedProjects.length,
        shared: sharedProjects.length,
        ownedProjects: ownedProjects.map(p => p.name),
        sharedProjects: sharedProjects.map(p => p.name)
      })

      setProjects(uniqueProjects)
      
    } catch (error: any) {
      console.error('💥 Error in fetchProjects:', error)
      setError(error.message || 'Error desconocido')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener proyectos accesibles (alternativa más robusta)
  const getAccessibleProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      console.log('🔄 [DEBUG getAccessibleProjects] User:', user.id)

      // PRIMERO: Proyectos creados por el usuario
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)

      if (ownedError) throw ownedError

      console.log('✅ [DEBUG] Owned projects:', ownedProjects)

      // SEGUNDO: Proyectos compartidos con equipos del usuario
      // Obtener equipos del usuario
      const { data: userTeams, error: teamsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)

      if (teamsError) throw teamsError

      console.log('✅ [DEBUG] User teams:', userTeams)

      let sharedProjects: any[] = []
      
      // Si el usuario está en equipos, buscar proyectos compartidos
      if (userTeams && userTeams.length > 0) {
        const teamIds = userTeams.map(ut => ut.team_id)
        
        console.log('🔄 [DEBUG] Looking for shared projects in teams:', teamIds)

        const { data: sharedData, error: sharedError } = await supabase
          .from('project_teams')
          .select(`
            project_id,
            projects (*)
          `)
          .in('team_id', teamIds)

        if (sharedError) throw sharedError

        console.log('✅ [DEBUG] Raw shared projects data:', sharedData)

        sharedProjects = (sharedData || [])
          .filter(item => item.projects !== null)
          .map(item => item.projects)

        console.log('✅ [DEBUG] Filtered shared projects:', sharedProjects)
      }

      // Combinar y eliminar duplicados
      const allProjects = [...(ownedProjects || []), ...sharedProjects]
      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      )

      console.log('📊 [DEBUG getAccessibleProjects] Final projects:', {
        total: uniqueProjects.length,
        owned: ownedProjects?.length || 0,
        shared: sharedProjects.length,
        allProjects: uniqueProjects.map(p => ({
          id: p.id,
          name: p.name,
          created_by: p.created_by,
          isOwner: p.created_by === user.id
        }))
      })

      return uniqueProjects
    } catch (error: any) {
      console.error('💥 Error in getAccessibleProjects:', error)
      throw error
    }
  }

  const createProject = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('🔄 [DEBUG createProject] Creating project for user:', user.id)

      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          name, 
          description,
          created_by: user.id 
        }])
        .select()
        .single()

      if (error) throw error
      
      console.log('✅ [DEBUG createProject] Project created:', data)

      // Actualizar la lista local
      setProjects(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  // Función para compartir proyecto con un equipo
  const shareProjectWithTeam = async (projectId: string, teamId: string, accessLevel: string = 'view') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('🔄 [DEBUG shareProjectWithTeam]', {
        projectId,
        teamId,
        accessLevel,
        userId: user.id
      })

      // Verificar que el usuario es el creador del proyecto o tiene permisos
      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('Proyecto no encontrado')
      
      if (project.created_by !== user.id) {
        console.warn('🚫 [DEBUG] User is not owner of project:', {
          projectOwner: project.created_by,
          currentUser: user.id
        })
        throw new Error('Solo el creador del proyecto puede compartirlo')
      }

      const { data, error } = await supabase
        .from('project_teams')
        .insert([{
          project_id: projectId,
          team_id: teamId,
          access_level: accessLevel
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ [DEBUG shareProjectWithTeam] Project shared successfully')

      await fetchProjects() // Recargar proyectos
      return data
    } catch (error: any) {
      console.error('Error sharing project with team:', error)
      throw error
    }
  }

  // Función para eliminar acceso de un equipo a un proyecto
  const removeProjectFromTeam = async (projectId: string, teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('🔄 [DEBUG removeProjectFromTeam]', {
        projectId,
        teamId,
        userId: user.id
      })

      // Verificar permisos
      const project = projects.find(p => p.id === projectId)
      if (!project) throw new Error('Proyecto no encontrado')
      
      if (project.created_by !== user.id) {
        console.warn('🚫 [DEBUG] User is not owner of project:', {
          projectOwner: project.created_by,
          currentUser: user.id
        })
        throw new Error('Solo el creador del proyecto puede eliminar el acceso')
      }

      const { error } = await supabase
        .from('project_teams')
        .delete()
        .eq('project_id', projectId)
        .eq('team_id', teamId)

      if (error) throw error

      console.log('✅ [DEBUG removeProjectFromTeam] Access removed successfully')

      await fetchProjects() // Recargar proyectos
    } catch (error: any) {
      console.error('Error removing project from team:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    shareProjectWithTeam,
    removeProjectFromTeam,
    getAccessibleProjects,
    refreshProjects: fetchProjects
  }
}
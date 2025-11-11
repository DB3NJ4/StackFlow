// hooks/useTeams.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTeams() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      console.log('🔄 Fetching teams for user:', user.id)

      // PRIMERO: Obtener los equipos donde el usuario es miembro
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            description,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (memberError) {
        console.error('❌ Error fetching member teams:', memberError)
        throw memberError
      }

      // SEGUNDO: Obtener los equipos donde el usuario es el creador
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', user.id)

      if (createdError) {
        console.error('❌ Error fetching created teams:', createdError)
        throw createdError
      }

      // Combinar y eliminar duplicados
      const memberTeamsData = (memberTeams || []).map(mt => ({
        ...mt.teams,
        userRole: mt.role,
        isMember: true
      }))

      const createdTeamsData = (createdTeams || []).map(team => ({
        ...team,
        userRole: 'owner',
        isMember: true
      }))

      // Combinar y eliminar duplicados por ID
      const allTeamsMap = new Map()
      
      ;[...memberTeamsData, ...createdTeamsData].forEach(team => {
        if (!allTeamsMap.has(team.id)) {
          allTeamsMap.set(team.id, team)
        }
      })

      const uniqueTeams = Array.from(allTeamsMap.values())
      console.log('✅ User teams loaded:', uniqueTeams)

      // TERCERO: Para cada equipo, cargar todos sus miembros de forma más robusta
      const teamsWithMembers = await Promise.all(
        uniqueTeams.map(async (team) => {
          try {
            // Intentar cargar miembros con diferentes enfoques
            let members = []
            
            try {
              // Enfoque 1: Intentar con la relación profiles
              const { data: membersData, error: membersError } = await supabase
                .from('team_members')
                .select(`
                  id,
                  user_id,
                  role,
                  profiles (
                    id,
                    email,
                    full_name
                  )
                `)
                .eq('team_id', team.id)

              if (!membersError && membersData) {
                // Transformar la estructura de miembros
                members = membersData.map(member => ({
                  id: member.id,
                  user_id: member.user_id,
                  role: member.role,
                  user: member.profiles ? {
                    id: member.profiles.id,
                    email: member.profiles.email,
                    full_name: member.profiles.full_name
                  } : {
                    id: member.user_id,
                    email: 'Usuario no disponible',
                    full_name: 'Usuario no disponible'
                  }
                }))
              } else {
                // Enfoque 2: Si falla, cargar solo los datos básicos
                const { data: basicMembersData, error: basicMembersError } = await supabase
                  .from('team_members')
                  .select('id, user_id, role')
                  .eq('team_id', team.id)

                if (!basicMembersError && basicMembersData) {
                  members = basicMembersData.map(member => ({
                    id: member.id,
                    user_id: member.user_id,
                    role: member.role,
                    user: {
                      id: member.user_id,
                      email: 'Usuario no disponible',
                      full_name: 'Usuario no disponible'
                    }
                  }))
                }
              }
            } catch (membersError) {
              console.warn(`⚠️ Could not load members for team ${team.id}, using empty array:`, membersError)
              members = []
            }

            return {
              ...team,
              members
            }
          } catch (error) {
            console.error(`💥 Error processing team ${team.id}:`, error)
            return {
              ...team,
              members: []
            }
          }
        })
      )

      console.log('✅ Teams with members loaded:', teamsWithMembers)
      setTeams(teamsWithMembers)
      
    } catch (error: any) {
      console.error('💥 Error in fetchTeams:', error)
      setError(error.message || 'Error desconocido')
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  // Funciones de permisos en el frontend
  const getUserRoleInTeam = (team: any, userId: string) => {
    if (team.created_by === userId) return 'owner'
    const member = team.members?.find((m: any) => m.user_id === userId)
    return member?.role || null
  }

  const canUserManageTeam = (team: any, userId: string) => {
    return team.created_by === userId
  }

  const canUserInviteToTeam = (team: any, userId: string) => {
    if (team.created_by === userId) return true
    
    const userMember = team.members?.find((m: any) => m.user_id === userId)
    return userMember?.role === 'admin'
  }

  const createTeam = async (name: string, description: string = '') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('teams')
        .insert([{ 
          name, 
          description,
          created_by: user.id 
        }])
        .select()
        .single()

      if (error) throw error

      // Agregar al creador como owner
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: user.id,
          role: 'owner'
        }])

      await fetchTeams()
      return data
    } catch (error: any) {
      console.error('Error creating team:', error)
      throw error
    }
  }

  const inviteMember = async (teamId: string, email: string, role: string = 'member') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Validar permisos en el frontend antes de enviar
      const team = teams.find(t => t.id === teamId)
      if (!team) throw new Error('Equipo no encontrado')

      if (!canUserInviteToTeam(team, user.id)) {
        throw new Error('No tienes permisos para invitar a este equipo')
      }

      // Si el usuario es admin, solo puede invitar como member
      if (getUserRoleInTeam(team, user.id) === 'admin' && role !== 'member') {
        throw new Error('Los administradores solo pueden invitar como miembros')
      }

      // Buscar usuario por email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (profileError || !profileData) {
        throw new Error('Usuario no encontrado')
      }

      // Verificar si el usuario ya es miembro
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', profileData.id)
        .single()

      if (existingMember) {
        throw new Error('Este usuario ya es miembro del equipo')
      }

      // Insertar miembro
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: profileData.id,
          role
        }])
        .select()
        .single()

      if (error) throw error

      await fetchTeams()
      return data
    } catch (error: any) {
      console.error('Error inviting member:', error)
      throw error
    }
  }

  const removeMember = async (teamId: string, memberId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Validar permisos
      const team = teams.find(t => t.id === teamId)
      if (!team) throw new Error('Equipo no encontrado')

      if (!canUserManageTeam(team, user.id)) {
        throw new Error('No tienes permisos para eliminar miembros de este equipo')
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', teamId)

      if (error) throw error

      await fetchTeams()
    } catch (error: any) {
      console.error('Error removing member:', error)
      throw error
    }
  }

  const getTeamProjects = async (teamId: string) => {
    try {
      console.log('🔄 Fetching projects for team:', teamId)
      
      const { data, error } = await supabase
        .from('project_teams')
        .select(`
          project_id,
          access_level,
          projects (
            id,
            name,
            description,
            created_by,
            created_at
          )
        `)
        .eq('team_id', teamId)

      if (error) {
        console.error('❌ Error fetching team projects:', error)
        throw error
      }

      console.log('✅ Team projects loaded:', data)

      // Filtrar proyectos que sean null/undefined y agregar validación
      const validProjects = (data || [])
        .filter(item => item.project !== null && item.project !== undefined)
        .map(item => ({
          ...item,
          project: {
            id: item.project?.id || 'unknown',
            name: item.project?.name || 'Proyecto sin nombre',
            description: item.project?.description || '',
            created_by: item.project?.created_by || '',
            created_at: item.project?.created_at || ''
          }
        }))

      return validProjects
    } catch (error: any) {
      console.error('💥 Error in getTeamProjects:', error)
      throw error
    }
  }

  const removeProjectFromTeam = async (teamId: string, projectId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('🔄 Removing project from team:', { teamId, projectId })

      // Validar permisos - solo owners y admins pueden eliminar proyectos
      const team = teams.find(t => t.id === teamId)
      if (!team) throw new Error('Equipo no encontrado')

      const userRole = getUserRoleInTeam(team, user.id)
      if (userRole !== 'owner' && userRole !== 'admin') {
        throw new Error('No tienes permisos para eliminar proyectos de este equipo')
      }

      // Eliminar la relación del proyecto con el equipo
      const { error } = await supabase
        .from('project_teams')
        .delete()
        .eq('team_id', teamId)
        .eq('project_id', projectId)

      if (error) {
        console.error('❌ Error removing project from team:', error)
        throw error
      }

      console.log('✅ Project removed from team successfully')
      
      return { success: true }
    } catch (error: any) {
      console.error('💥 Error in removeProjectFromTeam:', error)
      throw error
    }
  }

  const deleteTeam = async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('🔄 Deleting team:', teamId)

      // Validar permisos - solo owners pueden eliminar equipos
      const team = teams.find(t => t.id === teamId)
      if (!team) throw new Error('Equipo no encontrado')

      if (team.created_by !== user.id) {
        throw new Error('Solo el creador del equipo puede eliminarlo')
      }

      // Primero eliminar miembros del equipo
      const { error: membersError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)

      if (membersError) {
        console.error('Error deleting team members:', membersError)
        throw membersError
      }

      // Luego eliminar relaciones del equipo con proyectos
      const { error: projectsError } = await supabase
        .from('project_teams')
        .delete()
        .eq('team_id', teamId)

      if (projectsError) {
        console.error('Error deleting team projects:', projectsError)
        console.warn('Warning: Could not delete team projects, continuing...')
      }

      // Finalmente eliminar el equipo
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      console.log('✅ Team deleted successfully')
      await fetchTeams()
      
    } catch (error: any) {
      console.error('Error deleting team:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return {
    teams,
    loading,
    error,
    createTeam,
    inviteMember,
    removeMember,
    getTeamProjects,
    removeProjectFromTeam,
    deleteTeam,
    refreshTeams: fetchTeams
  }
}
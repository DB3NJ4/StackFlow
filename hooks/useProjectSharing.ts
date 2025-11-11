// hooks/useProjectSharing.ts
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProjectSharing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shareProjectWithUser = async (projectId: string, userEmail: string, accessLevel: string = 'view') => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('🔄 Compartiendo proyecto con usuario:', { projectId, userEmail, accessLevel })

      // Buscar usuario por email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .eq('email', userEmail.toLowerCase().trim())
        .single()

      if (profileError || !profileData) {
        throw new Error(`Usuario no encontrado: ${userEmail}`)
      }

      // Compartir proyecto con usuario individual
      const { data, error } = await supabase
        .from('project_users')
        .insert([{
          project_id: projectId,
          user_id: profileData.user_id,
          access_level: accessLevel,
          shared_by: user.id
        }])
        .select(`
          *,
          user:profiles(email, full_name)
        `)
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este usuario ya tiene acceso al proyecto')
        }
        throw error
      }

      console.log('✅ Proyecto compartido exitosamente:', data)
      return data
    } catch (error: any) {
      console.error('❌ Error sharing project:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const shareProjectWithTeam = async (projectId: string, teamId: string, accessLevel: string = 'view') => {
    try {
      setLoading(true)
      setError(null)

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
        .select(`
          *,
          team:teams(name)
        `)
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error sharing project with team:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getProjectSharedUsers = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_users')
        .select(`
          *,
          user:profiles(email, full_name),
          shared_by_user:profiles!shared_by(email)
        `)
        .eq('project_id', projectId)

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching shared users:', error)
      throw error
    }
  }

  const removeProjectAccess = async (projectId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('project_users')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error removing project access:', error)
      throw error
    }
  }

  return {
    loading,
    error,
    shareProjectWithUser,
    shareProjectWithTeam,
    getProjectSharedUsers,
    removeProjectAccess
  }
}
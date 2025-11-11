import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Project } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

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
      
      setProjects(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    refreshProjects: fetchProjects
  }
}
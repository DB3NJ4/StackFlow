import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Issue } from '../types'

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentIssues()
  }, [])

  const fetchRecentIssues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setIssues(data || [])
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIssuesStats = () => {
    const total = issues.length
    const todo = issues.filter(issue => issue.status === 'todo').length
    const inProgress = issues.filter(issue => issue.status === 'in_progress').length
    const done = issues.filter(issue => issue.status === 'done').length

    return { total, todo, inProgress, done }
  }

  return {
    issues,
    loading,
    stats: getIssuesStats(),
    refreshIssues: fetchRecentIssues
  }
}
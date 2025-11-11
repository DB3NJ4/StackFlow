export interface User {
  id: string
  email: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}
export interface Team {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
  members?: TeamMember[]
  projects_count?: number
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    email: string
  }
}

export interface ProjectTeam {
  id: string
  project_id: string
  team_id: string
  access_level: 'view' | 'comment' | 'edit'
  added_at: string
  added_by: string
  team?: Team
}

export interface Issue {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project_id: string
  assigned_to: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type IssueStatus = Issue['status']
export type IssuePriority = Issue['priority']
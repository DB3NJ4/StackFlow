import { supabase } from './supabase'

export async function getUserEmail(userId: string): Promise<string> {
  try {
    // Esta es una función server-side que necesitarías crear
    // Por ahora, usemos un placeholder
    return `user-${userId.substring(0, 8)}@example.com`
  } catch (error) {
    console.error('Error getting user email:', error)
    return 'usuario@ejemplo.com'
  }
}
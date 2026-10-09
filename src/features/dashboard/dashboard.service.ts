import type { Database } from '../../lib/supabase/database.types'
import { supabase } from '../../lib/supabase/client'

export type Budget =
  Database['public']['Tables']['budgets']['Row']

export type PlannedExpense =
  Database['public']['Tables']['planned_expenses']['Row']

export async function getBudgets(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .lte('start_date', endDate)
    .gte('end_date', startDate)

  if (error) {
    throw error
  }

  return data
}

export async function getUpcomingPlannedExpenses(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from('planned_expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'upcoming')
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .order('due_date', {
      ascending: true,
    })
    .limit(5)

  if (error) {
    throw error
  }

  return data
}
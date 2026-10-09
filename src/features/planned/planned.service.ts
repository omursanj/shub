import type { Database } from '../../lib/supabase/database.types'
import { supabase } from '../../lib/supabase/client'

export type PlannedExpense =
  Database['public']['Tables']['planned_expenses']['Row']

export type PlannedExpenseStatus =
  | 'upcoming'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export type CreatePlannedExpenseInput = {
  name: string
  amount: number
  categoryId?: string | null
  currencyCode?: string
  dueDate: string
  recurring?: boolean
  isMandatory?: boolean
  note?: string
}

export async function getPlannedExpenses(
  userId: string,
) {
  const { data, error } = await supabase
    .from('planned_expenses')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', {
      ascending: true,
    })
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data
}

export async function createPlannedExpense(
  userId: string,
  input: CreatePlannedExpenseInput,
) {
  const { data, error } = await supabase
    .from('planned_expenses')
    .insert({
      user_id: userId,
      category_id:
        input.categoryId ?? null,
      name: input.name.trim(),
      amount: input.amount,
      currency_code:
        input.currencyCode ?? 'KZT',
      due_date: input.dueDate,
      recurring:
        input.recurring ?? false,
      is_mandatory:
        input.isMandatory ?? true,
      note:
        input.note?.trim() || null,
      status: 'upcoming',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePlannedExpenseStatus(
  plannedExpenseId: string,
  status: PlannedExpenseStatus,
) {
  const { data, error } = await supabase
    .from('planned_expenses')
    .update({
      status,
    })
    .eq('id', plannedExpenseId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deletePlannedExpense(
  plannedExpenseId: string,
) {
  const { error } = await supabase
    .from('planned_expenses')
    .delete()
    .eq('id', plannedExpenseId)

  if (error) {
    throw error
  }
}
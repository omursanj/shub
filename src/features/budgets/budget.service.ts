import type { Database } from '../../lib/supabase/database.types'
import { supabase } from '../../lib/supabase/client'

export type Budget =
  Database['public']['Tables']['budgets']['Row']

export type SaveBudgetInput = {
  categoryId: string | null
  amount: number
  currencyCode?: string
  startDate: string
  endDate: string
}

export async function getBudgets(
  userId: string,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('start_date', startDate)
    .eq('end_date', endDate)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data
}

export async function saveBudget(
  userId: string,
  input: SaveBudgetInput,
) {
  const baseQuery = supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId)
    .eq('start_date', input.startDate)
    .eq('end_date', input.endDate)

  const {
    data: existingBudget,
    error: lookupError,
  } =
    input.categoryId === null
      ? await baseQuery
          .is('category_id', null)
          .maybeSingle()
      : await baseQuery
          .eq(
            'category_id',
            input.categoryId,
          )
          .maybeSingle()

  if (lookupError) {
    throw lookupError
  }

  const payload = {
    amount: input.amount,
    currency_code:
      input.currencyCode ?? 'KZT',
    period: 'monthly',
    start_date: input.startDate,
    end_date: input.endDate,
  }

  if (existingBudget) {
    const { data, error } = await supabase
      .from('budgets')
      .update(payload)
      .eq('id', existingBudget.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      category_id: input.categoryId,
      ...payload,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteBudget(
  budgetId: string,
) {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)

  if (error) {
    throw error
  }
}
import type { Database } from '../../lib/supabase/database.types'
import { supabase } from '../../lib/supabase/client'

export type Transaction =
  Database['public']['Tables']['transactions']['Row']

export type Category =
  Database['public']['Tables']['categories']['Row']

export type CreateTransactionInput = {
  type: 'expense' | 'income' | 'transfer'
  amount: number
  categoryId?: string | null
  currencyCode?: string
  exchangeRate?: number
  date: string
  storeName?: string
  productName?: string
  note?: string
}

export async function getTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput,
) {
  const currencyCode = input.currencyCode ?? 'KZT'
  const exchangeRate = input.exchangeRate ?? 1

  const baseAmount = input.amount * exchangeRate

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      category_id: input.categoryId ?? null,
      type: input.type,
      amount: input.amount,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      base_amount: baseAmount,
      transaction_date: input.date,
      store_name: input.storeName ?? null,
      product_name: input.productName ?? null,
      note: input.note ?? null,
      scope: 'personal',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function archiveTransaction(
  transactionId: string,
) {
  const { error } = await supabase
    .from('transactions')
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq('id', transactionId)

  if (error) {
    throw error
  }
}
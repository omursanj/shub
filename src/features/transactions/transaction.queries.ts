import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  archiveTransaction,
  createTransaction,
  getCategories,
  getTransactions,
} from './transaction.service'

import type {
  CreateTransactionInput,
} from './transaction.service'

export const transactionKeys = {
  all: ['transactions'] as const,

  list: (userId: string) =>
    [...transactionKeys.all, 'list', userId] as const,

  categories: (userId: string) =>
    ['categories', userId] as const,
}

export function useTransactions(userId?: string) {
  return useQuery({
    queryKey: userId
      ? transactionKeys.list(userId)
      : ['transactions', 'disabled'],

    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      return getTransactions(userId)
    },

    enabled: Boolean(userId),
  })
}

export function useCategories(userId?: string) {
  return useQuery({
    queryKey: userId
      ? transactionKeys.categories(userId)
      : ['categories', 'disabled'],

    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      return getCategories(userId)
    },

    enabled: Boolean(userId),
  })
}

export function useCreateTransaction(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      return createTransaction(userId, input)
    },

    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: transactionKeys.list(userId),
      })
    },
  })
}

export function useArchiveTransaction(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: archiveTransaction,

    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({
        queryKey: transactionKeys.list(userId),
      })
    },
  })
}
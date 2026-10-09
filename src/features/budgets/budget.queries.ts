import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  deleteBudget,
  getBudgets,
  saveBudget,
} from './budget.service'

import type {
  SaveBudgetInput,
} from './budget.service'

export const budgetKeys = {
  all: ['budgets'] as const,

  month: (
    userId: string,
    startDate: string,
    endDate: string,
  ) =>
    [
      ...budgetKeys.all,
      userId,
      startDate,
      endDate,
    ] as const,
}

export function useBudgetList(
  userId: string | undefined,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: userId
      ? budgetKeys.month(
          userId,
          startDate,
          endDate,
        )
      : ['budgets', 'disabled'],

    queryFn: () => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return getBudgets(
        userId,
        startDate,
        endDate,
      )
    },

    enabled: Boolean(userId),
  })
}

export function useSaveBudget(
  userId: string | undefined,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: SaveBudgetInput,
    ) => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return saveBudget(
        userId,
        input,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: budgetKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'dashboard',
            'budgets',
          ],
        }),
      ])
    },
  })
}

export function useDeleteBudget(
  userId: string | undefined,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      budgetId: string,
    ) => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return deleteBudget(
        budgetId,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: budgetKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'dashboard',
            'budgets',
          ],
        }),
      ])
    },
  })
}
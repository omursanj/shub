import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createPlannedExpense,
  deletePlannedExpense,
  getPlannedExpenses,
  updatePlannedExpenseStatus,
} from './planned.service'

import type {
  CreatePlannedExpenseInput,
  PlannedExpenseStatus,
} from './planned.service'

export const plannedKeys = {
  all: ['planned-expenses'] as const,

  list: (userId: string) =>
    [
      ...plannedKeys.all,
      userId,
    ] as const,
}

export function usePlannedExpenses(
  userId?: string,
) {
  return useQuery({
    queryKey: userId
      ? plannedKeys.list(userId)
      : [
          'planned-expenses',
          'disabled',
        ],

    queryFn: () => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return getPlannedExpenses(
        userId,
      )
    },

    enabled: Boolean(userId),
  })
}

export function useCreatePlannedExpense(
  userId?: string,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: CreatePlannedExpenseInput,
    ) => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return createPlannedExpense(
        userId,
        input,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            plannedKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'dashboard',
            'planned-expenses',
          ],
        }),
      ])
    },
  })
}

export function useUpdatePlannedExpenseStatus(
  userId?: string,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: PlannedExpenseStatus
    }) => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return updatePlannedExpenseStatus(
        id,
        status,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            plannedKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'dashboard',
            'planned-expenses',
          ],
        }),
      ])
    },
  })
}

export function useDeletePlannedExpense(
  userId?: string,
) {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      if (!userId) {
        throw new Error(
          'User ID is required',
        )
      }

      return deletePlannedExpense(
        id,
      )
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            plannedKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'dashboard',
            'planned-expenses',
          ],
        }),
      ])
    },
  })
}
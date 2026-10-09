import { useQuery } from '@tanstack/react-query'

import {
  getBudgets,
  getUpcomingPlannedExpenses,
} from './dashboard.service'

export const dashboardKeys = {
  budgets: (
    userId: string,
    startDate: string,
    endDate: string,
  ) =>
    [
      'dashboard',
      'budgets',
      userId,
      startDate,
      endDate,
    ] as const,

  plannedExpenses: (
    userId: string,
    startDate: string,
    endDate: string,
  ) =>
    [
      'dashboard',
      'planned-expenses',
      userId,
      startDate,
      endDate,
    ] as const,
}

export function useBudgets(
  userId: string | undefined,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: userId
      ? dashboardKeys.budgets(
          userId,
          startDate,
          endDate,
        )
      : [
          'dashboard',
          'budgets',
          'disabled',
        ],

    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required')
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

export function useUpcomingPlannedExpenses(
  userId: string | undefined,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: userId
      ? dashboardKeys.plannedExpenses(
          userId,
          startDate,
          endDate,
        )
      : [
          'dashboard',
          'planned-expenses',
          'disabled',
        ],

    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required')
      }

      return getUpcomingPlannedExpenses(
        userId,
        startDate,
        endDate,
      )
    },

    enabled: Boolean(userId),
  })
}
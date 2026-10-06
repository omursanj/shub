import { createBrowserRouter } from 'react-router'

import { HomePage } from '../pages/HomePage'
import { TransactionsPage } from '../pages/TransactionsPage'
import { BudgetsPage } from '../pages/BudgetsPage'
import { AnalyticsPage } from '../pages/AnalyticsPage'
import { PlannedPage } from '../pages/PlannedPage'
import { SubscriptionsPage } from '../pages/SubscriptionsPage'
import { GoalsPage } from '../pages/GoalsPage'
import { DebtsPage } from '../pages/DebtsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/transactions',
    element: <TransactionsPage />,
  },
  {
    path: '/budgets',
    element: <BudgetsPage />,
  },
  {
    path: '/analytics',
    element: <AnalyticsPage />,
  },
  {
    path: '/planned',
    element: <PlannedPage />,
  },
  {
    path: '/subscriptions',
    element: <SubscriptionsPage />,
  },
  {
    path: '/goals',
    element: <GoalsPage />,
  },
  {
    path: '/debts',
    element: <DebtsPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
import { createBrowserRouter } from 'react-router'

import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'

import { AnalyticsPage } from '../pages/AnalyticsPage'
import { BudgetsPage } from '../pages/BudgetsPage'
import { DebtsPage } from '../pages/DebtsPage'
import { GoalsPage } from '../pages/GoalsPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlannedPage } from '../pages/PlannedPage'
import { SettingsPage } from '../pages/SettingsPage'
import { SignupPage } from '../pages/SignupPage'
import { SubscriptionsPage } from '../pages/SubscriptionsPage'
import { TransactionsPage } from '../pages/TransactionsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/signup',
    Component: SignupPage,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: AppLayout,
        children: [
          {
            index: true,
            Component: HomePage,
          },
          {
            path: 'transactions',
            Component: TransactionsPage,
          },
          {
            path: 'budgets',
            Component: BudgetsPage,
          },
          {
            path: 'analytics',
            Component: AnalyticsPage,
          },
          {
            path: 'planned',
            Component: PlannedPage,
          },
          {
            path: 'subscriptions',
            Component: SubscriptionsPage,
          },
          {
            path: 'goals',
            Component: GoalsPage,
          },
          {
            path: 'debts',
            Component: DebtsPage,
          },
          {
            path: 'settings',
            Component: SettingsPage,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Goal,
  HandCoins,
  House,
  PiggyBank,
  ReceiptText,
  Settings,
  WalletCards,
} from 'lucide-react'
import { NavLink } from 'react-router'

const navigation = [
  {
    name: 'Home',
    to: '/',
    icon: House,
    end: true,
  },
  {
    name: 'Transactions',
    to: '/transactions',
    icon: ReceiptText,
  },
  {
    name: 'Budgets',
    to: '/budgets',
    icon: PiggyBank,
  },
  {
    name: 'Analytics',
    to: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Planned',
    to: '/planned',
    icon: CalendarDays,
  },
  {
    name: 'Subscriptions',
    to: '/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Goals',
    to: '/goals',
    icon: Goal,
  },
  {
    name: 'Debts',
    to: '/debts',
    icon: HandCoins,
  },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center px-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <WalletCards size={20} />
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              SHUB
            </p>

            <p className="text-xs text-slate-500">
              Personal Finance
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-950 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
            ].join(' ')
          }
        >
          <Settings size={19} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
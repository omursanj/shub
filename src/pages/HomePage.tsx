import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  PiggyBank,
  ReceiptText,
  ShoppingBasket,
  WalletCards,
} from 'lucide-react'

import { useAuth } from '../features/auth/useAuth'

import {
  useBudgets,
  useUpcomingPlannedExpenses,
} from '../features/dashboard/dashboard.queries'

import {
  useCategories,
  useTransactions,
} from '../features/transactions/transaction.queries'

function toDateString(date: Date) {
  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )

  return localDate
    .toISOString()
    .slice(0, 10)
}

function getMonthRange() {
  const now = new Date()

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  )

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  )

  return {
    today: toDateString(now),
    start: toDateString(start),
    end: toDateString(end),
    daysRemaining:
      end.getDate() - now.getDate() + 1,
  }
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

function formatMoney(
  amount: number,
  currencyCode = 'KZT',
) {
  if (currencyCode === 'KZT') {
    return `${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(amount)} ₸`
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`
  }
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(
    new Date(`${date}T00:00:00`),
  )
}

export function HomePage() {
  const { session } = useAuth()

  const userId = session?.user.id

  const monthRange = useMemo(
    () => getMonthRange(),
    [],
  )

  const transactionsQuery =
    useTransactions(userId)

  const categoriesQuery =
    useCategories(userId)

  const budgetsQuery = useBudgets(
    userId,
    monthRange.start,
    monthRange.end,
  )

  const plannedExpensesQuery =
    useUpcomingPlannedExpenses(
      userId,
      monthRange.today,
      monthRange.end,
    )

  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const budgets = useMemo(
    () => budgetsQuery.data ?? [],
    [budgetsQuery.data],
  )

  const plannedExpenses = useMemo(
    () => plannedExpensesQuery.data ?? [],
    [plannedExpensesQuery.data],
  )

  const categoryNames = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ]),
    )
  }, [categories])

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.transaction_date >=
          monthRange.start &&
        transaction.transaction_date <=
          monthRange.end,
    )
  }, [
    transactions,
    monthRange.start,
    monthRange.end,
  ])

  const allTimeTotals = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(
          transaction.base_amount,
        )

        if (
          transaction.type === 'income'
        ) {
          result.income += amount
        }

        if (
          transaction.type === 'expense'
        ) {
          result.expense += amount
        }

        return result
      },
      {
        income: 0,
        expense: 0,
      },
    )
  }, [transactions])

  const monthlyTotals = useMemo(() => {
    return monthlyTransactions.reduce(
      (result, transaction) => {
        const amount = Number(
          transaction.base_amount,
        )

        if (
          transaction.type === 'income'
        ) {
          result.income += amount
        }

        if (
          transaction.type === 'expense'
        ) {
          result.expense += amount
        }

        return result
      },
      {
        income: 0,
        expense: 0,
      },
    )
  }, [monthlyTransactions])

  const recordedBalance =
    allTimeTotals.income -
    allTimeTotals.expense

  const globalBudget = useMemo(
    () =>
      budgets.find(
        (budget) =>
          budget.category_id === null,
      ),
    [budgets],
  )

  const categoryBudgets = useMemo(() => {
    return new Map(
      budgets
        .filter(
          (budget) =>
            budget.category_id !== null,
        )
        .map((budget) => [
          budget.category_id as string,
          Number(budget.amount),
        ]),
    )
  }, [budgets])

  const monthlyBudget = useMemo(() => {
    if (globalBudget) {
      return Number(globalBudget.amount)
    }

    return budgets
      .filter(
        (budget) =>
          budget.category_id !== null,
      )
      .reduce(
        (sum, budget) =>
          sum + Number(budget.amount),
        0,
      )
  }, [budgets, globalBudget])

  const budgetUsedPercentage =
    monthlyBudget > 0
      ? (monthlyTotals.expense /
          monthlyBudget) *
        100
      : 0

  const budgetBarPercentage = Math.min(
    Math.max(budgetUsedPercentage, 0),
    100,
  )

  const budgetRemaining =
    monthlyBudget - monthlyTotals.expense

  const upcomingMandatoryTotal =
    useMemo(() => {
      return plannedExpenses
        .filter(
          (expense) =>
            expense.is_mandatory,
        )
        .reduce(
          (sum, expense) =>
            sum + Number(expense.amount),
          0,
        )
    }, [plannedExpenses])

  const realFreeMoney =
    recordedBalance -
    upcomingMandatoryTotal

  const safeToSpend =
    monthRange.daysRemaining > 0
      ? Math.max(realFreeMoney, 0) /
        monthRange.daysRemaining
      : 0

  const spendingByCategory = useMemo(() => {
    const totals = new Map<
      string,
      number
    >()

    monthlyTransactions
      .filter(
        (transaction) =>
          transaction.type ===
            'expense' &&
          transaction.category_id,
      )
      .forEach((transaction) => {
        const categoryId =
          transaction.category_id as string

        const previous =
          totals.get(categoryId) ?? 0

        totals.set(
          categoryId,
          previous +
            Number(
              transaction.base_amount,
            ),
        )
      })

    return Array.from(
      totals.entries(),
    )
      .map(([categoryId, amount]) => {
        const categoryBudget =
          categoryBudgets.get(categoryId)

        const share =
          monthlyTotals.expense > 0
            ? (amount /
                monthlyTotals.expense) *
              100
            : 0

        const progress =
          categoryBudget &&
          categoryBudget > 0
            ? (amount /
                categoryBudget) *
              100
            : share

        return {
          id: categoryId,
          name:
            categoryNames.get(
              categoryId,
            ) ?? 'Other',
          amount,
          budget: categoryBudget,
          progress,
        }
      })
      .sort(
        (first, second) =>
          second.amount - first.amount,
      )
      .slice(0, 3)
  }, [
    monthlyTransactions,
    categoryBudgets,
    categoryNames,
    monthlyTotals.expense,
  ])

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  )

  const isLoading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    budgetsQuery.isLoading ||
    plannedExpensesQuery.isLoading

  if (!userId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (transactionsQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Could not load your financial
        data.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Personal Finance Hub
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {getGreeting()}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s your real financial
            overview.
          </p>
        </div>

        <Link
          to="/transactions"
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <CircleDollarSign
            size={18}
          />
          Add transaction
        </Link>
      </header>

      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Recorded balance
            </p>

            <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatMoney(
                recordedBalance,
              )}
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Income minus expenses from
              your recorded transactions
            </p>
          </div>

          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <WalletCards size={24} />
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Safe to spend today
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-2xl font-semibold">
              {formatMoney(
                safeToSpend,
              )}
            </span>

            <span className="pb-1 text-sm text-slate-400">
              estimated per day
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Income"
          value={`+${formatMoney(
            monthlyTotals.income,
          )}`}
          icon={
            <ArrowUpRight
              size={20}
            />
          }
          helper="This month"
        />

        <StatCard
          title="Expenses"
          value={`−${formatMoney(
            monthlyTotals.expense,
          )}`}
          icon={
            <ArrowDownRight
              size={20}
            />
          }
          helper="This month"
        />

        <StatCard
          title="Monthly budget"
          value={
            monthlyBudget > 0
              ? formatMoney(
                  monthlyBudget,
                )
              : 'Not set'
          }
          icon={
            <PiggyBank size={20} />
          }
          helper={
            monthlyBudget > 0
              ? `${Math.round(
                  budgetUsedPercentage,
                )}% used`
              : 'Create a budget to track spending'
          }
        />

        <StatCard
          title="Real free money"
          value={formatMoney(
            realFreeMoney,
          )}
          icon={
            <ShoppingBasket
              size={20}
            />
          }
          helper="After mandatory planned expenses"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Monthly Budget
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {monthlyBudget > 0
                ? `${formatMoney(
                    monthlyTotals.expense,
                  )} / ${formatMoney(
                    monthlyBudget,
                  )}`
                : 'No budget set yet'}
            </p>
          </div>

          {monthlyBudget > 0 ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {Math.round(
                budgetUsedPercentage,
              )}
              %
            </span>
          ) : null}
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${budgetBarPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
          <span>
            Spent{' '}
            {formatMoney(
              monthlyTotals.expense,
            )}
          </span>

          <span>
            {monthlyBudget > 0
              ? `Remaining ${formatMoney(
                  Math.max(
                    budgetRemaining,
                    0,
                  ),
                )}`
              : 'Set a budget in Budgets'}
          </span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Spending
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Categories
              </h2>
            </div>

            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              View all
              <ChevronRight
                size={16}
              />
            </Link>
          </div>

          {spendingByCategory.length ===
          0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <ShoppingBasket
                size={26}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No spending yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Expenses will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {spendingByCategory.map(
                (category) => {
                  const progress =
                    Math.min(
                      category.progress,
                      100,
                    )

                  return (
                    <div
                      key={category.id}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-700">
                          {category.name}
                        </span>

                        <span className="text-sm font-medium text-slate-950">
                          {formatMoney(
                            category.amount,
                          )}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        {category.budget
                          ? `${Math.round(
                              category.progress,
                            )}% of category budget`
                          : `${Math.round(
                              category.progress,
                            )}% of monthly spending`}
                      </p>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Planned
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Upcoming payments
              </h2>
            </div>

            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <CalendarDays
                size={19}
              />
            </div>
          </div>

          {plannedExpenses.length ===
          0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <CalendarDays
                size={26}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                Nothing planned yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Planned expenses will appear
                here.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {plannedExpenses.map(
                (payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {payment.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatShortDate(
                          payment.due_date,
                        )}
                        {payment.is_mandatory
                          ? ' • Mandatory'
                          : ''}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-slate-950">
                      {formatMoney(
                        Number(
                          payment.amount,
                        ),
                        payment.currency_code,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}

          <Link
            to="/planned"
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            View planned expenses
            <ChevronRight
              size={16}
            />
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Activity
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Recent transactions
            </h2>
          </div>

          <Link
            to="/transactions"
            className="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            View all
            <ChevronRight
              size={16}
            />
          </Link>
        </div>

        {recentTransactions.length ===
        0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
            <ReceiptText
              size={28}
              className="text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No transactions yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map(
              (transaction) => {
                const isIncome =
                  transaction.type ===
                  'income'

                const categoryName =
                  transaction.category_id
                    ? categoryNames.get(
                        transaction.category_id,
                      )
                    : undefined

                const title =
                  transaction.store_name ||
                  transaction.product_name ||
                  categoryName ||
                  (isIncome
                    ? 'Income'
                    : 'Expense')

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft
                          size={18}
                        />
                      ) : (
                        <ArrowUpRight
                          size={18}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatShortDate(
                          transaction.transaction_date,
                        )}
                        {categoryName
                          ? ` • ${categoryName}`
                          : ''}
                      </p>
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        isIncome
                          ? 'text-emerald-600'
                          : 'text-slate-950'
                      }`}
                    >
                      {isIncome
                        ? '+'
                        : '−'}
                      {formatMoney(
                        Number(
                          transaction.amount,
                        ),
                        transaction.currency_code,
                      )}
                    </p>
                  </div>
                )
              },
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
        <p className="text-sm font-medium text-indigo-700">
          Monthly insight
        </p>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-950">
          {monthlyTransactions.length ===
          0
            ? 'Add transactions and SHUB will start building your monthly financial picture.'
            : monthlyBudget > 0
              ? `You have used ${Math.round(
                  budgetUsedPercentage,
                )}% of your monthly budget.`
              : `You recorded ${formatMoney(
                  monthlyTotals.income,
                )} in income and ${formatMoney(
                  monthlyTotals.expense,
                )} in expenses this month.`}
        </p>
      </section>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  helper: string
  icon: ReactNode
}

function StatCard({
  title,
  value,
  helper,
  icon,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {helper}
      </p>
    </article>
  )
}
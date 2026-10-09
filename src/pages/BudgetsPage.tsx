import {
  useMemo,
  useState,
} from 'react'

import {
  Loader2,
  PiggyBank,
  Plus,
  Save,
  Tags,
  Trash2,
  WalletCards,
} from 'lucide-react'

import { useAuth } from '../features/auth/useAuth'

import {
  useBudgetList,
  useDeleteBudget,
  useSaveBudget,
} from '../features/budgets/budget.queries'

import {
  useCategories,
  useTransactions,
} from '../features/transactions/transaction.queries'

function toDateString(
  date: Date,
) {
  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        60_000,
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
    start: toDateString(start),
    end: toDateString(end),

    label:
      new Intl.DateTimeFormat(
        'en',
        {
          month: 'long',
          year: 'numeric',
        },
      ).format(now),
  }
}

function formatMoney(
  amount: number,
) {
  return `${new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits: 2,
    },
  ).format(amount)} ₸`
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function BudgetsPage() {
  const { session } = useAuth()

  const userId =
    session?.user.id

  const month = useMemo(
    () => getMonthRange(),
    [],
  )

  const budgetsQuery =
    useBudgetList(
      userId,
      month.start,
      month.end,
    )

  const categoriesQuery =
    useCategories(userId)

  const transactionsQuery =
    useTransactions(userId)

  const saveBudget =
    useSaveBudget(userId)

  const deleteBudget =
    useDeleteBudget(userId)

  const [totalBudgetInput, setTotalBudgetInput] =
    useState('')

  const [categoryId, setCategoryId] =
    useState('')

  const [
    categoryBudgetInput,
    setCategoryBudgetInput,
  ] = useState('')

  const [
    statusMessage,
    setStatusMessage,
  ] = useState('')

  const budgets = useMemo(
    () => budgetsQuery.data ?? [],
    [budgetsQuery.data],
  )

  const categories = useMemo(
    () =>
      categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const transactions = useMemo(
    () =>
      transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )

  const globalBudget =
    useMemo(
      () =>
        budgets.find(
          (budget) =>
            budget.category_id ===
            null,
        ),
      [budgets],
    )

  const categoryBudgets =
    useMemo(
      () =>
        budgets.filter(
          (budget) =>
            budget.category_id !==
            null,
        ),
      [budgets],
    )

  const categoryNames =
    useMemo(() => {
      return new Map(
        categories.map(
          (category) => [
            category.id,
            category.name,
          ],
        ),
      )
    }, [categories])

  const monthlyExpenses =
    useMemo(() => {
      return transactions
        .filter(
          (transaction) =>
            transaction.type ===
              'expense' &&
            transaction
              .transaction_date >=
              month.start &&
            transaction
              .transaction_date <=
              month.end,
        )
        .reduce(
          (sum, transaction) =>
            sum +
            Number(
              transaction.base_amount,
            ),
          0,
        )
    }, [
      transactions,
      month.start,
      month.end,
    ])

  const categorySpending =
    useMemo(() => {
      const totals =
        new Map<
          string,
          number
        >()

      transactions
        .filter(
          (transaction) =>
            transaction.type ===
              'expense' &&
            transaction.category_id &&
            transaction
              .transaction_date >=
              month.start &&
            transaction
              .transaction_date <=
              month.end,
        )
        .forEach(
          (transaction) => {
            const id =
              transaction.category_id as string

            totals.set(
              id,
              (totals.get(id) ?? 0) +
                Number(
                  transaction.base_amount,
                ),
            )
          },
        )

      return totals
    }, [
      transactions,
      month.start,
      month.end,
    ])

  const totalBudget =
    globalBudget
      ? Number(
          globalBudget.amount,
        )
      : 0

  const remaining =
    totalBudget -
    monthlyExpenses

  const usedPercentage =
    totalBudget > 0
      ? (monthlyExpenses /
          totalBudget) *
        100
      : 0

  async function handleSaveTotalBudget() {
    setStatusMessage('')

    const amount = Number(
      totalBudgetInput.replace(
        ',',
        '.',
      ),
    )

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setStatusMessage(
        'Enter a valid monthly budget.',
      )
      return
    }

    try {
      await saveBudget.mutateAsync({
        categoryId: null,
        amount,
        currencyCode: 'KZT',
        startDate: month.start,
        endDate: month.end,
      })

      setTotalBudgetInput('')

      setStatusMessage(
        'Monthly budget saved.',
      )
    } catch (error) {
      setStatusMessage(
        getErrorMessage(error),
      )
    }
  }

  async function handleSaveCategoryBudget() {
    setStatusMessage('')

    if (!categoryId) {
      setStatusMessage(
        'Choose a category.',
      )
      return
    }

    const amount = Number(
      categoryBudgetInput.replace(
        ',',
        '.',
      ),
    )

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setStatusMessage(
        'Enter a valid category budget.',
      )
      return
    }

    try {
      await saveBudget.mutateAsync({
        categoryId,
        amount,
        currencyCode: 'KZT',
        startDate: month.start,
        endDate: month.end,
      })

      setCategoryBudgetInput('')
      setCategoryId('')

      setStatusMessage(
        'Category budget saved.',
      )
    } catch (error) {
      setStatusMessage(
        getErrorMessage(error),
      )
    }
  }

  async function handleDelete(
    budgetId: string,
  ) {
    setStatusMessage('')

    try {
      await deleteBudget.mutateAsync(
        budgetId,
      )

      setStatusMessage(
        'Budget removed.',
      )
    } catch (error) {
      setStatusMessage(
        getErrorMessage(error),
      )
    }
  }

  const isLoading =
    budgetsQuery.isLoading ||
    categoriesQuery.isLoading ||
    transactionsQuery.isLoading

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
            Loading budgets...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header>
        <p className="text-sm font-medium text-indigo-600">
          Spending limits
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Budgets
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {month.label}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Monthly budget"
          value={
            totalBudget > 0
              ? formatMoney(
                  totalBudget,
                )
              : 'Not set'
          }
          icon={
            <PiggyBank
              size={20}
            />
          }
        />

        <StatCard
          title="Spent"
          value={formatMoney(
            monthlyExpenses,
          )}
          icon={
            <WalletCards
              size={20}
            />
          }
        />

        <StatCard
          title="Remaining"
          value={
            totalBudget > 0
              ? formatMoney(
                  remaining,
                )
              : '—'
          }
          icon={
            <Tags size={20} />
          }
          danger={
            totalBudget > 0 &&
            remaining < 0
          }
        />
      </section>

      {totalBudget > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Overall progress
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-950">
                {Math.round(
                  usedPercentage,
                )}
                % used
              </p>
            </div>

            <p className="text-sm font-medium text-slate-500">
              {formatMoney(
                monthlyExpenses,
              )}{' '}
              /{' '}
              {formatMoney(
                totalBudget,
              )}
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                usedPercentage > 100
                  ? 'bg-red-500'
                  : usedPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
              }`}
              style={{
                width: `${Math.min(
                  usedPercentage,
                  100,
                )}%`,
              }}
            />
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <PiggyBank
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                Monthly budget
              </h2>

              <p className="text-sm text-slate-500">
                Set one overall spending
                limit.
              </p>
            </div>
          </div>

          {globalBudget ? (
            <div className="mb-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Current limit
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-xl font-semibold text-slate-950">
                  {formatMoney(
                    Number(
                      globalBudget.amount,
                    ),
                  )}
                </p>

                <button
                  type="button"
                  disabled={
                    deleteBudget.isPending
                  }
                  onClick={() =>
                    void handleDelete(
                      globalBudget.id,
                    )
                  }
                  className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Remove monthly budget"
                >
                  <Trash2
                    size={16}
                  />
                </button>
              </div>
            </div>
          ) : null}

          <label
            htmlFor="total-budget"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <div className="relative">
            <input
              id="total-budget"
              type="number"
              min="0"
              step="1"
              value={
                totalBudgetInput
              }
              onChange={(event) =>
                setTotalBudgetInput(
                  event.target.value,
                )
              }
              placeholder="400000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-14 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₸
            </span>
          </div>

          <button
            type="button"
            disabled={
              saveBudget.isPending
            }
            onClick={() =>
              void handleSaveTotalBudget()
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {saveBudget.isPending ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            Save monthly budget
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Plus size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                Category budget
              </h2>

              <p className="text-sm text-slate-500">
                Limit Food, Transport,
                Shopping and more.
              </p>
            </div>
          </div>

          <label
            htmlFor="budget-category"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <select
            id="budget-category"
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value,
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="">
              Choose category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ),
            )}
          </select>

          <label
            htmlFor="category-budget"
            className="mb-2 mt-4 block text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <div className="relative">
            <input
              id="category-budget"
              type="number"
              min="0"
              step="1"
              value={
                categoryBudgetInput
              }
              onChange={(event) =>
                setCategoryBudgetInput(
                  event.target.value,
                )
              }
              placeholder="80000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-14 text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₸
            </span>
          </div>

          <button
            type="button"
            disabled={
              saveBudget.isPending
            }
            onClick={() =>
              void handleSaveCategoryBudget()
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus size={17} />
            Save category budget
          </button>
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {statusMessage}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Category limits
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare actual spending with
            your limits.
          </p>
        </div>

        {categoryBudgets.length ===
        0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center p-6 text-center">
            <Tags
              size={28}
              className="text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No category budgets yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add your first category
              limit above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categoryBudgets.map(
              (budget) => {
                const categoryIdValue =
                  budget.category_id as string

                const limit =
                  Number(
                    budget.amount,
                  )

                const spent =
                  categorySpending.get(
                    categoryIdValue,
                  ) ?? 0

                const percentage =
                  limit > 0
                    ? (spent /
                        limit) *
                      100
                    : 0

                return (
                  <div
                    key={budget.id}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {categoryNames.get(
                                categoryIdValue,
                              ) ??
                                'Category'}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatMoney(
                                spent,
                              )}{' '}
                              spent of{' '}
                              {formatMoney(
                                limit,
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm font-semibold ${
                                percentage >
                                100
                                  ? 'text-red-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {Math.round(
                                percentage,
                              )}
                              %
                            </span>

                            <button
                              type="button"
                              disabled={
                                deleteBudget.isPending
                              }
                              onClick={() =>
                                void handleDelete(
                                  budget.id,
                                )
                              }
                              className="flex size-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                              title="Remove budget"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentage >
                              100
                                ? 'bg-red-500'
                                : percentage >
                                    80
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                percentage,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
            )}
          </div>
        )}
      </section>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  icon: React.ReactNode
  danger?: boolean
}

function StatCard({
  title,
  value,
  icon,
  danger = false,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-semibold tracking-tight ${
              danger
                ? 'text-red-600'
                : 'text-slate-950'
            }`}
          >
            {value}
          </p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>
    </article>
  )
}
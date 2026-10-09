import { useMemo, useState } from 'react'

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  ChartNoAxesCombined,
  CircleDollarSign,
  Loader2,
  PiggyBank,
  ReceiptText,
  TrendingUp,
} from 'lucide-react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAuth } from '../features/auth/useAuth'

import {
  useCategories,
  useTransactions,
} from '../features/transactions/transaction.queries'

type Period =
  | '1M'
  | '3M'
  | '6M'
  | '1Y'
  | 'ALL'

const periods: Period[] = [
  '1M',
  '3M',
  '6M',
  '1Y',
  'ALL',
]

const chartColors = [
  '#4f46e5',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#64748b',
]

function toDateString(date: Date) {
  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )

  return localDate
    .toISOString()
    .slice(0, 10)
}

function getPeriodStart(
  period: Period,
) {
  if (period === 'ALL') {
    return null
  }

  const date = new Date()

  if (period === '1M') {
    date.setMonth(
      date.getMonth() - 1,
    )
  }

  if (period === '3M') {
    date.setMonth(
      date.getMonth() - 3,
    )
  }

  if (period === '6M') {
    date.setMonth(
      date.getMonth() - 6,
    )
  }

  if (period === '1Y') {
    date.setFullYear(
      date.getFullYear() - 1,
    )
  }

  return toDateString(date)
}

function formatMoney(
  amount: number,
) {
  return `${new Intl.NumberFormat(
    'en-US',
    {
      maximumFractionDigits: 0,
    },
  ).format(amount)} ₸`
}

function formatCompactMoney(
  amount: number,
) {
  if (
    Math.abs(amount) >=
    1_000_000
  ) {
    return `${(
      amount / 1_000_000
    ).toFixed(1)}M`
  }

  if (
    Math.abs(amount) >= 1000
  ) {
    return `${(
      amount / 1000
    ).toFixed(0)}K`
  }

  return String(
    Math.round(amount),
  )
}

function daysBetween(
  start: string,
  end: string,
) {
  const startDate = new Date(
    `${start}T00:00:00`,
  )

  const endDate = new Date(
    `${end}T00:00:00`,
  )

  const milliseconds =
    endDate.getTime() -
    startDate.getTime()

  return Math.max(
    1,
    Math.floor(
      milliseconds /
        (1000 * 60 * 60 * 24),
    ) + 1,
  )
}

function formatChartDate(
  value: string,
) {
  if (value.length === 7) {
    return new Intl.DateTimeFormat(
      'en',
      {
        month: 'short',
        year: '2-digit',
      },
    ).format(
      new Date(
        `${value}-01T00:00:00`,
      ),
    )
  }

  return new Intl.DateTimeFormat(
    'en',
    {
      day: 'numeric',
      month: 'short',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

export function AnalyticsPage() {
  const { session } = useAuth()

  const userId =
    session?.user.id

  const [period, setPeriod] =
    useState<Period>('1M')

  const transactionsQuery =
    useTransactions(userId)

  const categoriesQuery =
    useCategories(userId)

  const transactions = useMemo(
    () =>
      transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )

  const categories = useMemo(
    () =>
      categoriesQuery.data ?? [],
    [categoriesQuery.data],
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

  const periodStart =
    useMemo(
      () =>
        getPeriodStart(period),
      [period],
    )

  const filteredTransactions =
    useMemo(() => {
      if (!periodStart) {
        return transactions
      }

      return transactions.filter(
        (transaction) =>
          transaction
            .transaction_date >=
          periodStart,
      )
    }, [
      transactions,
      periodStart,
    ])

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (result, transaction) => {
        const amount = Number(
          transaction.base_amount,
        )

        if (
          transaction.type ===
          'income'
        ) {
          result.income += amount
        }

        if (
          transaction.type ===
          'expense'
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
  }, [filteredTransactions])

  const savings =
    totals.income -
    totals.expense

  const savingsRate =
    totals.income > 0
      ? (savings /
          totals.income) *
        100
      : null

  const expenseTransactions =
    useMemo(
      () =>
        filteredTransactions.filter(
          (transaction) =>
            transaction.type ===
            'expense',
        ),
      [filteredTransactions],
    )

  const largestExpense =
    useMemo(() => {
      if (
        expenseTransactions.length ===
        0
      ) {
        return null
      }

      return expenseTransactions.reduce(
        (largest, transaction) =>
          Number(
            transaction.base_amount,
          ) >
          Number(
            largest.base_amount,
          )
            ? transaction
            : largest,
      )
    }, [expenseTransactions])

  const categoryData =
    useMemo(() => {
      const totalsByCategory =
        new Map<
          string,
          number
        >()

      expenseTransactions.forEach(
        (transaction) => {
          const categoryId =
            transaction.category_id ??
            'uncategorized'

          const current =
            totalsByCategory.get(
              categoryId,
            ) ?? 0

          totalsByCategory.set(
            categoryId,
            current +
              Number(
                transaction.base_amount,
              ),
          )
        },
      )

      return Array.from(
        totalsByCategory.entries(),
      )
        .map(
          ([categoryId, amount]) => ({
            id: categoryId,

            name:
              categoryId ===
              'uncategorized'
                ? 'Uncategorized'
                : categoryNames.get(
                    categoryId,
                  ) ??
                  'Other',

            amount,
          }),
        )
        .sort(
          (first, second) =>
            second.amount -
            first.amount,
        )
    }, [
      expenseTransactions,
      categoryNames,
    ])

  const topCategory =
    categoryData[0] ?? null

  const today =
    useMemo(
      () =>
        toDateString(
          new Date(),
        ),
      [],
    )

  const periodDays =
    useMemo(() => {
      if (periodStart) {
        return daysBetween(
          periodStart,
          today,
        )
      }

      if (
        filteredTransactions.length ===
        0
      ) {
        return 1
      }

      const oldestDate =
        filteredTransactions[
          filteredTransactions.length -
            1
        ]?.transaction_date

      if (!oldestDate) {
        return 1
      }

      return daysBetween(
        oldestDate,
        today,
      )
    }, [
      filteredTransactions,
      periodStart,
      today,
    ])

  const averageDailySpending =
    totals.expense / periodDays

  const trendData =
    useMemo(() => {
      const grouped =
        new Map<
          string,
          {
            income: number
            expense: number
          }
        >()

      filteredTransactions.forEach(
        (transaction) => {
          const key =
            period === '1M'
              ? transaction
                  .transaction_date
              : transaction.transaction_date.slice(
                  0,
                  7,
                )

          const current =
            grouped.get(key) ?? {
              income: 0,
              expense: 0,
            }

          const amount = Number(
            transaction.base_amount,
          )

          if (
            transaction.type ===
            'income'
          ) {
            current.income += amount
          }

          if (
            transaction.type ===
            'expense'
          ) {
            current.expense += amount
          }

          grouped.set(
            key,
            current,
          )
        },
      )

      return Array.from(
        grouped.entries(),
      )
        .sort(
          ([first], [second]) =>
            first.localeCompare(
              second,
            ),
        )
        .map(
          ([
            date,
            values,
          ]) => ({
            date,
            label:
              formatChartDate(date),
            income:
              Math.round(
                values.income,
              ),
            expense:
              Math.round(
                values.expense,
              ),
          }),
        )
    }, [
      filteredTransactions,
      period,
    ])

  const isLoading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading

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
            Loading analytics...
          </p>
        </div>
      </div>
    )
  }

  if (
    transactionsQuery.isError ||
    categoriesQuery.isError
  ) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Could not load analytics.
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Financial insights
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Understand where your money
            comes from and where it goes.
          </p>
        </div>

        <div className="flex w-fit rounded-2xl bg-slate-100 p-1">
          {periods.map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setPeriod(item)
                }
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  period === item
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Income"
          value={formatMoney(
            totals.income,
          )}
          helper={`Selected period: ${period}`}
          icon={
            <ArrowUpRight
              size={20}
            />
          }
        />

        <StatCard
          title="Expenses"
          value={formatMoney(
            totals.expense,
          )}
          helper={`${expenseTransactions.length} expense transactions`}
          icon={
            <ArrowDownRight
              size={20}
            />
          }
        />

        <StatCard
          title="Savings"
          value={formatMoney(
            savings,
          )}
          helper={
            savingsRate === null
              ? 'No income recorded'
              : `${savingsRate.toFixed(
                  1,
                )}% savings rate`
          }
          icon={
            <PiggyBank
              size={20}
            />
          }
          danger={
            savings < 0
          }
        />

        <StatCard
          title="Daily average"
          value={formatMoney(
            averageDailySpending,
          )}
          helper="Average spending per day"
          icon={
            <CalendarRange
              size={20}
            />
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-500">
              Cash flow
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Income vs expenses
            </h2>
          </div>

          {trendData.length ===
          0 ? (
            <EmptyChart />
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={trendData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="incomeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>

                    <linearGradient
                      id="expenseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.22}
                      />

                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={
                      formatCompactMoney
                    }
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border:
                        '1px solid #e2e8f0',
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                  />

                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Expense structure
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Categories
            </h2>
          </div>

          {categoryData.length ===
          0 ? (
            <EmptyChart />
          ) : (
            <>
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        categoryData
                      }
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryData.map(
                        (
                          category,
                          index,
                        ) => (
                          <Cell
                            key={
                              category.id
                            }
                            fill={
                              chartColors[
                                index %
                                  chartColors.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {categoryData
                  .slice(0, 5)
                  .map(
                    (
                      category,
                      index,
                    ) => {
                      const percentage =
                        totals.expense >
                        0
                          ? (category.amount /
                              totals.expense) *
                            100
                          : 0

                      return (
                        <div
                          key={
                            category.id
                          }
                          className="flex items-center gap-3"
                        >
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                chartColors[
                                  index %
                                    chartColors.length
                                ],
                            }}
                          />

                          <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
                            {
                              category.name
                            }
                          </span>

                          <span className="text-xs text-slate-400">
                            {percentage.toFixed(
                              0,
                            )}
                            %
                          </span>

                          <span className="text-sm font-semibold text-slate-900">
                            {formatMoney(
                              category.amount,
                            )}
                          </span>
                        </div>
                      )
                    },
                  )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard
          title="Top category"
          value={
            topCategory
              ? topCategory.name
              : 'No data'
          }
          description={
            topCategory
              ? formatMoney(
                  topCategory.amount,
                )
              : 'Add expenses to see your top category.'
          }
          icon={
            <ChartNoAxesCombined
              size={20}
            />
          }
        />

        <InsightCard
          title="Largest expense"
          value={
            largestExpense
              ? formatMoney(
                  Number(
                    largestExpense.amount,
                  ),
                )
              : 'No data'
          }
          description={
            largestExpense
              ? largestExpense.store_name ||
                largestExpense.product_name ||
                (largestExpense.category_id
                  ? categoryNames.get(
                      largestExpense.category_id,
                    )
                  : undefined) ||
                'Expense'
              : 'No expense recorded in this period.'
          }
          icon={
            <CircleDollarSign
              size={20}
            />
          }
        />

        <InsightCard
          title="Savings rate"
          value={
            savingsRate === null
              ? '—'
              : `${savingsRate.toFixed(
                  1,
                )}%`
          }
          description={
            savingsRate === null
              ? 'Income is required to calculate this.'
              : savingsRate >= 0
                ? 'Income kept after expenses.'
                : 'Expenses are higher than income.'
          }
          icon={
            <TrendingUp
              size={20}
            />
          }
        />
      </section>

      {filteredTransactions.length ===
      0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ReceiptText
            size={30}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 font-semibold text-slate-950">
            No data for this period
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try another period or add
            more transactions.
          </p>
        </section>
      ) : null}
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  helper: string
  icon: React.ReactNode
  danger?: boolean
}

function StatCard({
  title,
  value,
  helper,
  icon,
  danger = false,
}: StatCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p
            className={`mt-2 truncate text-2xl font-semibold tracking-tight ${
              danger
                ? 'text-red-600'
                : 'text-slate-950'
            }`}
          >
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

type InsightCardProps = {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function InsightCard({
  title,
  value,
  description,
  icon,
}: InsightCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-semibold text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </article>
  )
}

function EmptyChart() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <ChartNoAxesCombined
        size={28}
        className="text-slate-300"
      />

      <p className="mt-3 text-sm font-medium text-slate-600">
        Not enough data yet
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Analytics will appear as you add
        transactions.
      </p>
    </div>
  )
}
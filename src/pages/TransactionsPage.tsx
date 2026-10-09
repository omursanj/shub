import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Archive,
  Loader2,
  ReceiptText,
  WalletCards,
} from 'lucide-react'

import { useAuth } from '../features/auth/useAuth'
import { QuickAddTransaction } from '../features/transactions/QuickAddTransaction'

import {
  useArchiveTransaction,
  useCategories,
  useCreateTransaction,
  useTransactions,
} from '../features/transactions/transaction.queries'

import type {
  CreateTransactionInput,
} from '../features/transactions/transaction.service'

type FilterType = 'all' | 'expense' | 'income'

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function TransactionsPage() {
  const { session } = useAuth()

  const userId = session?.user.id

  const [filter, setFilter] =
    useState<FilterType>('all')

  const transactionsQuery =
    useTransactions(userId)

  const categoriesQuery =
    useCategories(userId)

  const createTransaction =
    useCreateTransaction(userId)

  const archiveTransaction =
    useArchiveTransaction(userId)

  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const categoryNames = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ]),
    )
  }, [categories])

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') {
      return transactions
    }

    return transactions.filter(
      (transaction) =>
        transaction.type === filter,
    )
  }, [filter, transactions])

  const totals = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(
          transaction.base_amount,
        )

        if (transaction.type === 'income') {
          result.income += amount
        }

        if (transaction.type === 'expense') {
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

  const balance =
    totals.income - totals.expense

  async function handleCreate(
    input: CreateTransactionInput,
  ) {
    await createTransaction.mutateAsync(input)
  }

  async function handleArchive(
    transactionId: string,
  ) {
    await archiveTransaction.mutateAsync(
      transactionId,
    )
  }

  if (!userId) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Transactions
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your real income and expenses stored
          securely in SHUB.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ArrowDownLeft size={20} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Income
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {formatMoney(totals.income)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ArrowUpRight size={20} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Expenses
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {formatMoney(totals.expense)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <WalletCards size={20} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Net
          </p>

          <p
            className={`mt-1 text-2xl font-semibold tracking-tight ${
              balance < 0
                ? 'text-red-600'
                : 'text-slate-950'
            }`}
          >
            {formatMoney(balance)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <QuickAddTransaction
          categories={categories}
          onCreate={handleCreate}
          isSubmitting={
            createTransaction.isPending
          }
        />

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-950">
                  History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {transactions.length}{' '}
                  {transactions.length === 1
                    ? 'transaction'
                    : 'transactions'}
                </p>
              </div>

              <div className="flex rounded-2xl bg-slate-100 p-1">
                {(
                  [
                    ['all', 'All'],
                    ['expense', 'Expenses'],
                    ['income', 'Income'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(value)
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                      filter === value
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {transactionsQuery.isLoading ||
          categoriesQuery.isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={28}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading transactions...
                </p>
              </div>
            </div>
          ) : transactionsQuery.isError ? (
            <div className="p-6">
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {getErrorMessage(
                  transactionsQuery.error,
                )}
              </div>
            </div>
          ) : filteredTransactions.length ===
            0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ReceiptText size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                No transactions yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Add your first income or expense
                using the form on this page.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map(
                (transaction) => {
                  const isIncome =
                    transaction.type === 'income'

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
                    <article
                      key={transaction.id}
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                    >
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft
                            size={20}
                          />
                        ) : (
                          <ArrowUpRight
                            size={20}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {title}
                          </h3>

                          {categoryName ? (
                            <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 sm:inline">
                              {categoryName}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-400">
                          <span>
                            {formatDate(
                              transaction.transaction_date,
                            )}
                          </span>

                          {transaction.note ? (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {transaction.note}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isIncome
                              ? 'text-emerald-600'
                              : 'text-slate-950'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatMoney(
                            Number(
                              transaction.amount,
                            ),
                            transaction.currency_code,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        title="Archive transaction"
                        disabled={
                          archiveTransaction.isPending
                        }
                        onClick={() =>
                          void handleArchive(
                            transaction.id,
                          )
                        }
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                      >
                        <Archive size={16} />
                      </button>
                    </article>
                  )
                },
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
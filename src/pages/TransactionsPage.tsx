import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import { QuickAddTransaction } from '../features/transactions/QuickAddTransaction'
import type { TransactionFormValues } from '../features/transactions/transaction.schema'

type Transaction = TransactionFormValues & {
  id: number
}

const initialTransactions: Transaction[] = [
  {
    id: 1,
    type: 'expense',
    amount: 6480,
    category: 'Food',
    date: '2026-10-05',
  },
  {
    id: 2,
    type: 'expense',
    amount: 8000,
    category: 'Transport',
    date: '2026-10-04',
  },
  {
    id: 3,
    type: 'income',
    amount: 650000,
    category: 'Other',
    date: '2026-10-01',
  },
]

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replaceAll(',', ' ')
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions)

  function handleAddTransaction(
    values: TransactionFormValues,
  ) {
    const newTransaction: Transaction = {
      id: Date.now(),
      ...values,
    }

    setTransactions((current) => [
      newTransaction,
      ...current,
    ])
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Money activity
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your income and expenses in one place.
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <QuickAddTransaction
          onAdd={handleAddTransaction}
        />

        <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Recent transactions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {transactions.length}{' '}
                  {transactions.length === 1
                    ? 'transaction'
                    : 'transactions'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Search transactions"
                  className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <Search size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Filter transactions"
                  className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No transactions yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add your first transaction using the form.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
                const isIncome =
                  transaction.type === 'income'

                return (
                  <article
                    key={transaction.id}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div
                      className={[
                        'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                        isIncome
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-600',
                      ].join(' ')}
                    >
                      {isIncome ? (
                        <ArrowUpRight size={20} />
                      ) : (
                        <ArrowDownRight size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {transaction.category}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(transaction.date)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={[
                          'text-sm font-semibold',
                          isIncome
                            ? 'text-emerald-600'
                            : 'text-slate-950',
                        ].join(' ')}
                      >
                        {isIncome ? '+' : '−'}
                        {formatMoney(transaction.amount)} ₸
                      </p>

                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {transaction.type}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
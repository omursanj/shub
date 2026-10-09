import {
  useMemo,
  useState,
} from 'react'

import type {
  FormEvent,
  ReactNode,
} from 'react'

import {
  CalendarClock,
  Check,
  CircleAlert,
  Loader2,
  Plus,
  Repeat2,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'

import { useAuth } from '../features/auth/useAuth'

import {
  useCategories,
} from '../features/transactions/transaction.queries'

import {
  useCreatePlannedExpense,
  useDeletePlannedExpense,
  usePlannedExpenses,
  useUpdatePlannedExpenseStatus,
} from '../features/planned/planned.queries'

import type {
  CreatePlannedExpenseInput,
  PlannedExpense,
  PlannedExpenseStatus,
} from '../features/planned/planned.service'

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

function formatMoney(
  amount: number,
  currencyCode = 'KZT',
) {
  if (currencyCode === 'KZT') {
    return `${new Intl.NumberFormat(
      'en-US',
      {
        maximumFractionDigits: 2,
      },
    ).format(amount)} ₸`
  }

  return `${amount.toFixed(
    2,
  )} ${currencyCode}`
}

function formatDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    'en',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${date}T00:00:00`,
    ),
  )
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

function getDisplayStatus(
  expense: PlannedExpense,
  today: string,
): PlannedExpenseStatus {
  if (
    expense.status === 'upcoming' &&
    expense.due_date < today
  ) {
    return 'overdue'
  }

  if (
    expense.status === 'paid'
  ) {
    return 'paid'
  }

  if (
    expense.status ===
    'cancelled'
  ) {
    return 'cancelled'
  }

  return 'upcoming'
}

export function PlannedPage() {
  const { session } = useAuth()

  const userId =
    session?.user.id

  const today = useMemo(
    () =>
      toDateString(
        new Date(),
      ),
    [],
  )

  const plannedQuery =
    usePlannedExpenses(userId)

  const categoriesQuery =
    useCategories(userId)

  const createExpense =
    useCreatePlannedExpense(
      userId,
    )

  const updateStatus =
    useUpdatePlannedExpenseStatus(
      userId,
    )

  const deleteExpense =
    useDeletePlannedExpense(
      userId,
    )

  const expenses = useMemo(
    () => plannedQuery.data ?? [],
    [plannedQuery.data],
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

  const [name, setName] =
    useState('')

  const [amount, setAmount] =
    useState('')

  const [
    categoryId,
    setCategoryId,
  ] = useState('')

  const [
    dueDate,
    setDueDate,
  ] = useState(today)

  const [
    recurring,
    setRecurring,
  ] = useState(false)

  const [
    mandatory,
    setMandatory,
  ] = useState(true)

  const [note, setNote] =
    useState('')

  const [
    statusMessage,
    setStatusMessage,
  ] = useState('')

  const upcomingExpenses =
    useMemo(
      () =>
        expenses.filter(
          (expense) =>
            expense.status ===
            'upcoming',
        ),
      [expenses],
    )

  const upcomingTotal =
    useMemo(
      () =>
        upcomingExpenses.reduce(
          (sum, expense) =>
            sum +
            Number(
              expense.amount,
            ),
          0,
        ),
      [upcomingExpenses],
    )

  const mandatoryTotal =
    useMemo(
      () =>
        upcomingExpenses
          .filter(
            (expense) =>
              expense.is_mandatory,
          )
          .reduce(
            (sum, expense) =>
              sum +
              Number(
                expense.amount,
              ),
            0,
          ),
      [upcomingExpenses],
    )

  const overdueCount =
    useMemo(
      () =>
        upcomingExpenses.filter(
          (expense) =>
            expense.due_date <
            today,
        ).length,
      [
        upcomingExpenses,
        today,
      ],
    )

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setStatusMessage('')

    const parsedAmount =
      Number(
        amount.replace(
          ',',
          '.',
        ),
      )

    if (!name.trim()) {
      setStatusMessage(
        'Enter a payment name.',
      )
      return
    }

    if (
      !Number.isFinite(
        parsedAmount,
      ) ||
      parsedAmount <= 0
    ) {
      setStatusMessage(
        'Enter a valid amount.',
      )
      return
    }

    const input:
      CreatePlannedExpenseInput =
      {
        name,
        amount: parsedAmount,
        categoryId:
          categoryId || null,
        dueDate,
        recurring,
        isMandatory:
          mandatory,
        note:
          note || undefined,
      }

    try {
      await createExpense.mutateAsync(
        input,
      )

      setName('')
      setAmount('')
      setCategoryId('')
      setDueDate(today)
      setRecurring(false)
      setMandatory(true)
      setNote('')

      setStatusMessage(
        'Planned expense added.',
      )
    } catch (error) {
      setStatusMessage(
        getErrorMessage(error),
      )
    }
  }

  async function handleStatus(
    id: string,
    status: PlannedExpenseStatus,
  ) {
    setStatusMessage('')

    try {
      await updateStatus.mutateAsync({
        id,
        status,
      })
    } catch (error) {
      setStatusMessage(
        getErrorMessage(error),
      )
    }
  }

  async function handleDelete(
    id: string,
  ) {
    setStatusMessage('')

    try {
      await deleteExpense.mutateAsync(
        id,
      )

      setStatusMessage(
        'Planned expense deleted.',
      )
    } catch (error) {
      setStatusMessage(
        getErrorMessage(error),
      )
    }
  }

  if (!userId) {
    return null
  }

  const isLoading =
    plannedQuery.isLoading ||
    categoriesQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading planned
            expenses...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header>
        <p className="text-sm font-medium text-indigo-600">
          Future cash flow
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Planned Expenses
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Record upcoming bills,
          rent, school payments,
          subscriptions and other
          future expenses.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Upcoming"
          value={formatMoney(
            upcomingTotal,
          )}
          icon={
            <CalendarClock
              size={20}
            />
          }
        />

        <StatCard
          title="Mandatory"
          value={formatMoney(
            mandatoryTotal,
          )}
          icon={
            <WalletCards
              size={20}
            />
          }
        />

        <StatCard
          title="Overdue"
          value={String(
            overdueCount,
          )}
          icon={
            <CircleAlert
              size={20}
            />
          }
          danger={
            overdueCount > 0
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form
          onSubmit={
            handleSubmit
          }
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Plus size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                Add planned expense
              </h2>

              <p className="text-sm text-slate-500">
                Add a future payment
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="planned-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Name
              </label>

              <input
                id="planned-name"
                required
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Rent, school, internet..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="planned-amount"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Amount
              </label>

              <div className="relative">
                <input
                  id="planned-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-14 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₸
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="planned-category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Category
              </label>

              <select
                id="planned-category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value,
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              >
                <option value="">
                  No category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="planned-date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Due date
              </label>

              <input
                id="planned-date"
                type="date"
                required
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value,
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="planned-note"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Note
              </label>

              <textarea
                id="planned-note"
                rows={3}
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value,
                  )
                }
                placeholder="Optional note"
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={
                  mandatory
                }
                onChange={(event) =>
                  setMandatory(
                    event.target
                      .checked,
                  )
                }
                className="mt-1 size-4"
              />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Mandatory
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Subtract this payment
                  from Real Free Money.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={
                  recurring
                }
                onChange={(event) =>
                  setRecurring(
                    event.target
                      .checked,
                  )
                }
                className="mt-1 size-4"
              />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Recurring
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Mark this as a repeating
                  payment.
                </p>
              </div>
            </label>

            {statusMessage ? (
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                {statusMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={
                createExpense.isPending
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {createExpense.isPending ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Plus
                  size={17}
                />
              )}

              Add planned expense
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Payment schedule
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {expenses.length}{' '}
              planned{' '}
              {expenses.length === 1
                ? 'expense'
                : 'expenses'}
            </p>
          </div>

          {plannedQuery.isError ? (
            <div className="p-6">
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {getErrorMessage(
                  plannedQuery.error,
                )}
              </div>
            </div>
          ) : expenses.length ===
            0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
              <CalendarClock
                size={30}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                Nothing planned yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add your first future
                payment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenses.map(
                (expense) => {
                  const displayStatus =
                    getDisplayStatus(
                      expense,
                      today,
                    )

                  const categoryName =
                    expense.category_id
                      ? categoryNames.get(
                          expense.category_id,
                        )
                      : undefined

                  return (
                    <article
                      key={
                        expense.id
                      }
                      className="p-5 sm:p-6"
                    >
                      <div className="flex gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-950">
                              {
                                expense.name
                              }
                            </h3>

                            <StatusBadge
                              status={
                                displayStatus
                              }
                            />

                            {expense.recurring ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                                <Repeat2
                                  size={
                                    12
                                  }
                                />
                                Recurring
                              </span>
                            ) : null}

                            {expense.is_mandatory ? (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                Mandatory
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            Due{' '}
                            {formatDate(
                              expense.due_date,
                            )}
                            {categoryName
                              ? ` • ${categoryName}`
                              : ''}
                          </p>

                          {expense.note ? (
                            <p className="mt-2 text-sm text-slate-400">
                              {
                                expense.note
                              }
                            </p>
                          ) : null}
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-slate-950">
                            {formatMoney(
                              Number(
                                expense.amount,
                              ),
                              expense.currency_code,
                            )}
                          </p>
                        </div>
                      </div>

                      {expense.status ===
                      'upcoming' ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={
                              updateStatus.isPending
                            }
                            onClick={() =>
                              void handleStatus(
                                expense.id,
                                'paid',
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check
                              size={14}
                            />
                            Mark paid
                          </button>

                          <button
                            type="button"
                            disabled={
                              updateStatus.isPending
                            }
                            onClick={() =>
                              void handleStatus(
                                expense.id,
                                'cancelled',
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
                          >
                            <X
                              size={14}
                            />
                            Cancel
                          </button>

                          <button
                            type="button"
                            disabled={
                              deleteExpense.isPending
                            }
                            onClick={() =>
                              void handleDelete(
                                expense.id,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2
                              size={14}
                            />
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <button
                            type="button"
                            disabled={
                              deleteExpense.isPending
                            }
                            onClick={() =>
                              void handleDelete(
                                expense.id,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2
                              size={14}
                            />
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  )
                },
              )}
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  icon: ReactNode
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

function StatusBadge({
  status,
}: {
  status: PlannedExpenseStatus
}) {
  const styles = {
    upcoming:
      'bg-indigo-50 text-indigo-600',

    paid:
      'bg-emerald-50 text-emerald-700',

    overdue:
      'bg-red-50 text-red-600',

    cancelled:
      'bg-slate-100 text-slate-500',
  }

  const labels = {
    upcoming: 'Upcoming',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  }

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
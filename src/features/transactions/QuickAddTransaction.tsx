import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDownLeft, ArrowUpRight, Loader2, Plus } from 'lucide-react'

import type {
  Category,
  CreateTransactionInput,
} from './transaction.service'

type QuickAddTransactionProps = {
  categories: Category[]
  onCreate: (input: CreateTransactionInput) => Promise<void>
  isSubmitting?: boolean
}

export function QuickAddTransaction({
  categories,
  onCreate,
  isSubmitting = false,
}: QuickAddTransactionProps) {
  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  )

  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [storeName, setStoreName] = useState('')
  const [note, setNote] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')

    const parsedAmount = Number(amount.replace(',', '.'))

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Enter a valid amount.')
      return
    }

    try {
      await onCreate({
        type,
        amount: parsedAmount,
        categoryId: categoryId || null,
        currencyCode: 'KZT',
        exchangeRate: 1,
        date,
        storeName: storeName.trim() || undefined,
        note: note.trim() || undefined,
      })

      setAmount('')
      setStoreName('')
      setNote('')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not add transaction.',
      )
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Plus size={20} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-950">
            Quick add
          </h2>

          <p className="text-sm text-slate-500">
            Record income or expense
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              type === 'expense'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <ArrowUpRight size={17} />
            Expense
          </button>

          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              type === 'income'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <ArrowDownLeft size={17} />
            Income
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="transaction-amount"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Amount
            </label>

            <div className="relative">
              <input
                id="transaction-amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-14 text-lg font-semibold text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                ₸
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="transaction-category"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Category
            </label>

            <select
              id="transaction-category"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">No category</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="transaction-date"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Date
            </label>

            <input
              id="transaction-date"
              type="date"
              required
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="transaction-store"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Store / source
            </label>

            <input
              id="transaction-store"
              type="text"
              value={storeName}
              onChange={(event) =>
                setStoreName(event.target.value)
              }
              placeholder={
                type === 'expense'
                  ? 'Magnum, Kaspi, Cafe...'
                  : 'Salary, client...'
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="transaction-note"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Note
            </label>

            <textarea
              id="transaction-note"
              rows={3}
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Optional note"
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Plus size={17} />
                Add transaction
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
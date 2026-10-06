import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'

import {
  transactionSchema,
  type TransactionFormValues,
} from './transaction.schema'

type QuickAddTransactionProps = {
  onAdd: (transaction: TransactionFormValues) => void
}

const categories = [
  'Food',
  'Housing',
  'Transport',
  'Health',
  'Sport',
  'Entertainment',
  'Education',
  'Shopping',
  'Subscriptions',
  'Travel',
  'Children / Family',
  'Gifts',
  'Other',
]

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

export function QuickAddTransaction({
  onAdd,
}: QuickAddTransactionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      category: '',
      date: getToday(),
    },
  })

  function onSubmit(values: TransactionFormValues) {
    onAdd(values)

    reset({
      type: 'expense',
      amount: undefined,
      category: '',
      date: getToday(),
    })
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-indigo-600">
          Quick add
        </p>

        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Add transaction
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Record an expense or income in a few seconds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Type
          </label>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <label className="cursor-pointer">
              <input
                type="radio"
                value="expense"
                {...register('type')}
                className="peer sr-only"
              />

              <div className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-slate-500 transition peer-checked:bg-white peer-checked:text-slate-950 peer-checked:shadow-sm">
                Expense
              </div>
            </label>

            <label className="cursor-pointer">
              <input
                type="radio"
                value="income"
                {...register('type')}
                className="peer sr-only"
              />

              <div className="rounded-xl px-4 py-2.5 text-center text-sm font-medium text-slate-500 transition peer-checked:bg-white peer-checked:text-slate-950 peer-checked:shadow-sm">
                Income
              </div>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Amount
          </label>

          <div className="relative">
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              {...register('amount', {
                valueAsNumber: true,
              })}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              ₸
            </span>
          </div>

          {errors.amount && (
            <p className="mt-2 text-xs font-medium text-rose-600">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <select
            id="category"
            {...register('category')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          {errors.category && (
            <p className="mt-2 text-xs font-medium text-rose-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="date"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Date
          </label>

          <input
            id="date"
            type="date"
            {...register('date')}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          />

          {errors.date && (
            <p className="mt-2 text-xs font-medium text-rose-600">
              {errors.date.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Add transaction
        </button>
      </form>
    </section>
  )
}
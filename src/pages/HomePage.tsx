import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  PiggyBank,
  ShoppingBasket,
  WalletCards,
} from 'lucide-react'

const upcomingPayments = [
  {
    id: 1,
    name: 'Netflix',
    date: '9 October',
    amount: '4 990 ₸',
  },
  {
    id: 2,
    name: 'Gym',
    date: '12 October',
    amount: '25 000 ₸',
  },
  {
    id: 3,
    name: 'Internet',
    date: '15 October',
    amount: '8 000 ₸',
  },
]

const categories = [
  {
    id: 1,
    name: 'Food',
    amount: '72 000 ₸',
    progress: 72,
  },
  {
    id: 2,
    name: 'Transport',
    amount: '38 000 ₸',
    progress: 95,
  },
  {
    id: 3,
    name: 'Entertainment',
    amount: '21 500 ₸',
    progress: 43,
  },
]

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Personal Finance Hub
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Good evening
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s your financial overview.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <CircleDollarSign size={18} />
          Add transaction
        </button>
      </header>

      {/* Main balance */}
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Available balance
            </p>

            <p className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              482 350 ₸
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Estimated balance across your finances
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
              ~7 740 ₸
            </span>

            <span className="pb-1 text-sm text-slate-400">
              per day
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Income"
          value="+650 000 ₸"
          icon={<ArrowUpRight size={20} />}
          helper="This month"
        />

        <StatCard
          title="Expenses"
          value="−167 650 ₸"
          icon={<ArrowDownRight size={20} />}
          helper="This month"
        />

        <StatCard
          title="Monthly budget"
          value="400 000 ₸"
          icon={<PiggyBank size={20} />}
          helper="42% used"
        />

        <StatCard
          title="Real free money"
          value="299 350 ₸"
          icon={<ShoppingBasket size={20} />}
          helper="After upcoming payments"
        />
      </section>

      {/* Budget */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Monthly Budget
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              167 650 ₸ / 400 000 ₸
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            42%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: '42%' }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>Spent 167 650 ₸</span>
          <span>Remaining 232 350 ₸</span>
        </div>
      </section>

      {/* Two columns */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Categories */}
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

            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              View all
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {category.name}
                  </span>

                  <span className="text-sm font-medium text-slate-950">
                    {category.amount}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-800"
                    style={{
                      width: `${category.progress}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {category.progress}% of budget
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming payments */}
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
              <CalendarDays size={19} />
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {upcomingPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {payment.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {payment.date}
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-950">
                  {payment.amount}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            View planned expenses
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Insight */}
      <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
        <p className="text-sm font-medium text-indigo-700">
          Monthly insight
        </p>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-950">
          You have used 42% of your monthly budget. Transport spending
          is currently close to its category limit.
        </p>
      </section>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  helper: string
  icon: React.ReactNode
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
type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-indigo-600">
          Personal Finance Hub
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">
          This module is ready for development.
        </p>
      </div>
    </section>
  )
}
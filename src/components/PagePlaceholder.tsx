type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-indigo-600">
          Personal Finance Hub
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-3 text-slate-500">
          {description}
        </p>
      </div>
    </main>
  )
}
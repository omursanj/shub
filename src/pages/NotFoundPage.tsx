import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-indigo-600">
          404
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Page not found
        </h1>

        <p className="mt-3 text-slate-500">
          The page you requested does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { CheckCircle2, WalletCards } from 'lucide-react'

import { useAuth } from '../features/auth/useAuth'
import { supabase } from '../lib/supabase/client'

export function SignupPage() {
  const { session, loading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  if (authLoading) {
    return null
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')
    setSuccess(false)

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    if (data.session) {
      return
    }

    setSuccess(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
            <WalletCards size={26} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Start building your personal financial space.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {success ? (
            <div className="text-center">
              <CheckCircle2
                className="mx-auto text-emerald-600"
                size={44}
              />

              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                Check your email
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We sent a confirmation link to {email}.
                Confirm your email and then sign in.
              </p>

              <Link
                to="/login"
                className="mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Repeat your password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-slate-950 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
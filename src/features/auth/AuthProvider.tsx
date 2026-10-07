import { useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '../../lib/supabase/client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) {
        return
      }

      if (error) {
        console.error('Could not load auth session:', error)
      }

      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }

  const value = useMemo(
    () => ({
      session,
      loading,
      signOut,
    }),
    [session, loading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
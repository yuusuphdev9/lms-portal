import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from './types'

interface ProfileRow {
  id: string
  name: string
  email: string
  role: Profile['role']
  avatar_url: string | null
  bio: string | null
  institution: string | null
  created_at: string
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    ...(row.avatar_url && { avatarUrl: row.avatar_url }),
    ...(row.bio && { bio: row.bio }),
    ...(row.institution && { institution: row.institution }),
    createdAt: row.created_at,
  }
}

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  /** True until the initial session check (and, if signed in, the profile fetch) has resolved. */
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Wraps the whole app (see `App.tsx`). Tracks the current Supabase Auth session and the
 * matching `profiles` row, and reacts to sign-in/sign-out from anywhere (including the
 * token refresh Supabase runs automatically in the background).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadProfile(userId: string) {
      const { data } = (await supabase.from('profiles').select('*').eq('id', userId).single()) as {
        data: ProfileRow | null
      }
      if (isMounted) setProfile(data ? mapProfile(data) : null)
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      const afterProfile = data.session ? loadProfile(data.session.user.id) : Promise.resolve()
      void afterProfile.then(() => {
        if (isMounted) setLoading(false)
      })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        void loadProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ session, profile, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

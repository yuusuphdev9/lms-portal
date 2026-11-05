import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      // `name` lands in the new user's auth metadata; the handle_new_user() trigger
      // (sql/001_schema_and_rls.sql) copies it into their profiles row on creation.
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw error
    },
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  })
}

import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useSignUp } from '@/features/auth/api'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'

export function SignupPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const signUp = useSignUp()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    signUp.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          // If the Supabase project has email confirmation turned off, signUp already
          // leaves the browser with a live session — otherwise there's a link to click first.
          void supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              void navigate('/', { replace: true })
            } else {
              setAwaitingConfirmation(true)
            }
          })
        },
      },
    )
  }

  if (awaitingConfirmation) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6 text-center">
        <div className="flex max-w-sm flex-col gap-2">
          <h1 className="font-heading text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Click it, then come back and sign in.
          </p>
          <Link to="/login" className="mt-3 text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">Sign up to start the LMS Student Portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value)
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="text-xs text-muted-foreground">
              Must include an uppercase letter, a lowercase letter, and a number.
            </p>
          </div>

          {signUp.isError && (
            <p className="text-sm font-medium text-destructive">
              {signUp.error instanceof Error ? signUp.error.message : 'Could not create your account.'}
            </p>
          )}

          <button
            type="submit"
            disabled={signUp.isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {signUp.isPending ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

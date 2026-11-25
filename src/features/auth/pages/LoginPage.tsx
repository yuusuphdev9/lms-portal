import { useState, type SubmitEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useSignIn } from '@/features/auth/api'
import { useAuth } from '@/features/auth/AuthContext'

export function LoginPage() {
  const { session } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const signIn = useSignIn()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (session) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from
    return <Navigate to={from?.pathname ?? '/'} replace />
  }

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    signIn.mutate(
      { email, password },
      {
        onSuccess: () => {
          void navigate('/', { replace: true })
        },
      },
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue to the LMS Student Portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              autoComplete="current-password"
              required
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

          {signIn.isError && (
            <p className="text-sm font-medium text-destructive">
              {signIn.error instanceof Error ? signIn.error.message : 'Could not sign in.'}
            </p>
          )}

          <button
            type="submit"
            disabled={signIn.isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {signIn.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&rsquo;t have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

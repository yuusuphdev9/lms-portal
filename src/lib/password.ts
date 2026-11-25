/**
 * Shared password-complexity rule for the sign-up and sign-in forms: at least
 * one uppercase letter, one lowercase letter, and one digit. Checked inside
 * each mutation (see `@/features/auth/api`) so a failure surfaces through the
 * same TanStack Query `isError` / `error` state the forms already render.
 */
export const PASSWORD_REQUIREMENT_MESSAGE =
  'Password must include an uppercase letter, a lowercase letter, and a number.'

export function isValidPassword(password: string): boolean {
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
}

export { cn } from 'cn'

/** A time-of-day greeting instead of a static "Welcome back" on every visit. */
export function timeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 5) return 'Still up studying'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Still up studying'
}

/** A short, human "updated 3 days ago" string instead of a raw ISO timestamp. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${String(minutes)}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${String(hours)}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${String(days)}d ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${String(weeks)}w ago`
  const months = Math.round(days / 30)
  return `${String(months)}mo ago`
}

/**
 * Deterministic accent color for a tag so repeated tags are visually consistent without
 * hardcoding every tag name — a small hash over 4 themed accent colors rather than every
 * course tag rendering in the same single primary teal.
 */
const TAG_ACCENTS = ['primary', 'clay', 'info', 'success'] as const
export type TagAccent = (typeof TAG_ACCENTS)[number]

export function accentForTag(tag: string): TagAccent {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0
  }
  return TAG_ACCENTS[hash % TAG_ACCENTS.length] ?? 'primary'
}

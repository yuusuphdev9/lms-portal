/**
 * User & identity domain types.
 */

export type UserRole = 'student' | 'instructor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
}

export interface StudentProfile {
  userId: string
  enrolledCourseIds: string[]
  bio?: string
  institution?: string
}

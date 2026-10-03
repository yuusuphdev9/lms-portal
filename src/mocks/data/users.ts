import type { User } from '@/types'

export const currentUser: User = {
  id: 'user-1',
  name: 'Ramadan Adeleke',
  email: 'huwayzee@gmail.com',
  role: 'student',
  createdAt: '2026-01-12T09:00:00.000Z',
}

export const instructor: User = {
  id: 'user-2',
  name: 'Dr. Bisi Fashola',
  email: 'b.fashola@example.edu',
  role: 'instructor',
  createdAt: '2025-08-01T09:00:00.000Z',
}

export const users: User[] = [currentUser, instructor]

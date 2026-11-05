export interface Profile {
  id: string
  name: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  avatarUrl?: string
  bio?: string
  institution?: string
  createdAt: string
}

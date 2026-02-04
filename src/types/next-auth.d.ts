import 'next-auth'
import type { UserRole } from './enums'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: UserRole
      manufacturerId: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string | null
    role: UserRole
    manufacturerId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    manufacturerId: string | null
  }
}

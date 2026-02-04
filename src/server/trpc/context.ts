import { auth } from '@/server/auth/config'
import { prisma } from '@/lib/prisma'

export async function createContext() {
  const session = await auth()

  return {
    prisma,
    session,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

import { auth } from '@/server/auth/config'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/features/dashboard/dashboard-content'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return <DashboardContent user={session.user} />
}

import { redirect } from 'next/navigation'
import { auth } from '@/server/auth/config'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>
}

import { getOrCreateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  try {
    const user = await getOrCreateUser()
    return (
      <DashboardClient
        userName={user.name ?? user.email}
        totalSessions={0}
      />
    )
  } catch {
    redirect('/sign-in')
  }
}

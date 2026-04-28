import { getOrCreateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  try {
    const user = await getOrCreateUser()
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Welcome, {user.name ?? user.email}</h1>
        <p>Your account is ready. More features coming soon.</p>
      </main>
    )
  } catch {
    redirect('/sign-in')
  }
}

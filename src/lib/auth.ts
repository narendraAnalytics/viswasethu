import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getOrCreateUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error('Unauthorized')

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

  const [existing] = await db.select().from(users).where(eq(users.id, userId))

  if (!existing) {
    const [newUser] = await db.insert(users).values({
      id: userId,
      email,
      name,
      plan: 'free',
    }).returning()
    return newUser
  }

  // Backfill email/name if missing (e.g. created before this fix)
  if (!existing.email || !existing.name) {
    const [updated] = await db.update(users)
      .set({ email: existing.email || email, name: existing.name || name })
      .where(eq(users.id, userId))
      .returning()
    return updated
  }

  return existing
}

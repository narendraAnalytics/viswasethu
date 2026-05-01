import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getPlanFromHas } from '@/lib/plans'

export async function getOrCreateUser() {
  const { userId, has } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error('Unauthorized')

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null
  const clerkPlan = getPlanFromHas(has)

  const [existing] = await db.select().from(users).where(eq(users.id, userId))

  if (!existing) {
    const [newUser] = await db.insert(users).values({
      id: userId,
      email,
      name,
      plan: clerkPlan,
    }).returning()
    return newUser
  }

  // Lazy plan sync + backfill email/name in one update if anything changed
  const needsUpdate = existing.plan !== clerkPlan || !existing.email || !existing.name
  if (needsUpdate) {
    const [updated] = await db.update(users)
      .set({
        plan: clerkPlan,
        email: existing.email || email,
        name: existing.name || name,
      })
      .where(eq(users.id, userId))
      .returning()
    return updated
  }

  return existing
}

export type PlanSlug = 'free' | 'plus' | 'pro'

export const PLAN_LIMITS = {
  free: { sessionSeconds: 300,  sessionsPerMonth: 2  },
  plus: { sessionSeconds: 1200, sessionsPerMonth: 15 },
  pro:  { sessionSeconds: 2700, sessionsPerMonth: Infinity },
} as const

// Badge shown in Navbar — reads from Clerk session token via useAuth().has()
export const PLAN_BADGE: Record<PlanSlug, { label: string; bg: string; color: string } | null> = {
  free: null,
  plus: { label: 'PLUS', bg: 'linear-gradient(135deg,#D97706,#EA580C)', color: '#fff' },
  pro:  { label: 'PRO',  bg: 'linear-gradient(135deg,#059669,#047857)', color: '#fff' },
}

// Lazy plan sync — no webhooks needed.
// Call in any API route / Server Component that touches plan-gated features.
// Reads plan from Clerk `has()`, returns the slug, caller writes to DB if changed.
export function getPlanFromHas(
  has: (params: { plan?: string }) => boolean,
): PlanSlug {
  if (has({ plan: 'pro' }))  return 'pro'
  if (has({ plan: 'plus' })) return 'plus'
  return 'free'
}

import { pgTable, text, varchar, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  nativeLanguage: varchar('native_language', { length: 50 }),
  plan: varchar('plan', { length: 20 }).default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nativeLanguage: varchar('native_language', { length: 10 }).notNull(),
  jobType: varchar('job_type', { length: 50 }).notNull(),
  country: varchar('country', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
})

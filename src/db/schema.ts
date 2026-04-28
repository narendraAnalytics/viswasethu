import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  nativeLanguage: varchar('native_language', { length: 50 }),
  plan: varchar('plan', { length: 20 }).default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const captchas = pgTable('captchas', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  imageUrl: text('image_url').notNull(),
  accuracyPercentage: integer('accuracy_percentage').notNull(),
  gridType: varchar('grid_type', { length: 10 }).notNull(),
  correctCells: jsonb('correct_cells').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
});

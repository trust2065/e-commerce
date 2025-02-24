import {
  pgTable,
  integer,
  jsonb,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';
import { relations } from 'drizzle-orm';
import { UserTable } from './user';
import { ProductTable } from './product';

export const PurchaseTable = pgTable('purchases', {
  id,
  // since stripe use cents
  pricePaidInCents: integer().notNull(),
  // the product price/name can be changed in the future, but we want to keep the product detail when it got purchased
  productDetails: jsonb()
    .notNull()
    .$type<{ name: string; description: string; imageUrl: string; }>(),
  userId: uuid()
    .notNull()
    .references(() => UserTable.id, { onDelete: 'restrict' }),
  productId: uuid()
    .notNull()
    .references(() => ProductTable.id, { onDelete: 'restrict' }),
  stripeSessionId: text().notNull().unique(),
  refundedAt: timestamp({ withTimezone: true }),
  createdAt,
  updatedAt,
});

export const PurchaseRelationships = relations(PurchaseTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [PurchaseTable.userId],
    references: [UserTable.id],
  }),
  product: one(ProductTable, {
    fields: [PurchaseTable.productId],
    references: [ProductTable.id],
  }),
}));
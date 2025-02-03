import { relations } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createdAt, id, updatedAt } from '../schemaHelpers';
import { CourseProductTable } from './courseProduct';
import { UserCourseAccessTable } from './userCourseAccess';

export const CourseTable = pgTable('courses', {
  id,
  name: text().notNull(),
  description: text().notNull(),
  createdAt,
  updatedAt,
});

export const CourseRelationships = relations(CourseTable, ({ many }) => ({
  courseProducts: many(CourseProductTable),
  userCourseAccesses: many(UserCourseAccessTable),
}));
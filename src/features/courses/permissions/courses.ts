import { eq } from 'drizzle-orm';
import { CourseSectionTable, UserRole } from '../../../drizzle/schema';

export function canCreateCourse({ role }: { role: UserRole | undefined; }) {
  return role === 'admin';
}

export function canDeleteCourses({ role }: { role: UserRole | undefined; }) {
  return role === 'admin';
}

export function canUpdateCourses({ role }: { role: UserRole | undefined; }) {
  return role === 'admin';
}

export const wherePublicCourseSections = eq(CourseSectionTable.status, "public");
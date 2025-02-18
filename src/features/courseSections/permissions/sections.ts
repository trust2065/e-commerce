import { eq } from 'drizzle-orm';
import { CourseSectionTable, UserRole } from '../../../drizzle/schema';

export function canCreateCourseSections({ role }: { role: UserRole | undefined; }) {
  return role === 'admin';
}

export function canDeleteCourseSections({ role }: { role: UserRole | undefined; }) {
  return role === 'admin';
}

export function canUpdateCourseSections({ role }: { role: UserRole | undefined; }) {
  return role === 'admin';
}

export const wherePublicCourseSections = eq(CourseSectionTable.status, "public");
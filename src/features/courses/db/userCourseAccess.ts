import { db } from '../../../drizzle/db';
import { UserCourseAccessTable } from '../../../drizzle/schema';
import { revalidateUserCourseAccessCache } from './cache/userCourseAccess';

export default async function addUserCourseAccess({
  userId,
  courseIds,
}: {
  userId: string;
  courseIds: string[];
}, trx: Omit<typeof db, '$client'> = db) {
  const accesses = await trx
    .insert(UserCourseAccessTable)
    .values(
      courseIds.map(courseId => ({
        userId,
        courseId,
      }))
    )
    .onConflictDoNothing()
    .returning();

  accesses.forEach(access => {
    revalidateUserCourseAccessCache(access);
  });

  return accesses;
}
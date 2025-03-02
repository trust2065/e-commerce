import { db } from '@/drizzle/db';
import { UserLessonCompleteTable } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { revalidateUserLessonCompleteCache } from './cache/userLessonComplete';

export async function updateLessonCompleteStatus({
  lessonId,
  userId,
  complete,
}: {
  lessonId: string;
  userId: string;
  complete: boolean;
}) {
  let result: { lessonId: string; userId: string; } | undefined;
  if (complete) {
    const [dbResult] = await db
      .insert(UserLessonCompleteTable)
      .values({
        lessonId,
        userId,
      })
      .onConflictDoNothing()
      .returning();
    result = dbResult;
  } else {
    const [deResult] = await db
      .delete(UserLessonCompleteTable)
      .where(
        and(
          eq(UserLessonCompleteTable.lessonId, lessonId),
          eq(UserLessonCompleteTable.userId, userId)
        )
      )
      .returning();
    result = deResult;
  }

  if (result == null) {
    return;
  }

  revalidateUserLessonCompleteCache({
    lessonId: result.lessonId,
    userId: result.userId,
  });

  return result;
}
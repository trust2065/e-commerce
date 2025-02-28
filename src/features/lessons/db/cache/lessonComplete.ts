import { revalidateTag } from 'next/cache';
import { getGlobalTag, getIdTag } from '../../../../lib/dataCache';


export function getUserLessonCompleteGlobalTag() {
  return getGlobalTag('userLessonComplete');
}

export function getUserLessonCompleteUserTag(userId: string) {
  return getIdTag("userLessonComplete", userId);
}

export function getUserLessonCompleteIdTag(lessonId: string, userId: string) {
  return getIdTag("userLessonComplete", `lesson:${lessonId}-user:${userId}`);
}

export function revalidateUserLessonCompleteCache(userId: string) {
  revalidateTag(getUserLessonCompleteUserTag(userId));

}
type CACHE_TAG = 'users' | 'courses' | 'lessons' | 'courseSections' | 'userCourseAccess' | 'products' | 'purchases';

export function getGlobalTag(tag: CACHE_TAG) {
  return `global:${tag}` as const;
}

export function getIdTag(tag: CACHE_TAG, id: string) {
  return `id:${tag}:${id}` as const;
}

export function getUserTag(tag: CACHE_TAG, userId: string) {
  return `user:${userId}-${tag}` as const;
}

export function getCourseTag(tag: CACHE_TAG, courseId: string) {
  return `course:${courseId}-${tag}` as const;
}
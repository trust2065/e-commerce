import { revalidateTag } from 'next/cache';
// import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getGlobalTag, getIdTag } from '../../../lib/dataCache';

export function getUserGlobalTag() {
  return getGlobalTag('users');
}

export function getUserIdTag(userId: string) {
  return getIdTag('users', userId);
}

export function revalidateUserCache(userId: string) {
  revalidateTag(getUserGlobalTag());
  revalidateTag(getUserIdTag(userId));
}

// function getUser(id: string) {
//   "use cache";
//   cacheTag(getUserIdTag(id));
// }

// function getAllUsers() {
//   "use cache";
//   cacheTag(getUserGlobalTag());
// }
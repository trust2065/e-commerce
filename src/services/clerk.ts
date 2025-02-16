import { auth, clerkClient } from '@clerk/nextjs/server';
import { UserRole, UserTable } from '../drizzle/schema';
import { getUserIdTag } from '../features/users/db/cache';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { db } from '../drizzle/db';
import { eq } from 'drizzle-orm';

const client = await clerkClient();

export function syncClerkUserMetadata(user: {
  id: string;
  clerkUserId: string;
  role: UserRole;
}) {
  return client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    }
  });
}

export async function getCurrentUser({ allData = false }: { allData?: boolean; } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  return {
    clerkUserId: userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    user: allData && sessionClaims?.dbId != null ? await getUser(sessionClaims.dbId) : undefined,
    redirectToSignIn
  };
}

async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id)
  });
}
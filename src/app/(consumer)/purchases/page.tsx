import { asc, eq } from 'drizzle-orm';
import { db } from '../../../drizzle/db';
import { PurchaseTable } from '../../../drizzle/schema';
import { PageHeader } from '../../../components/PageHeader';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getPurchaseUserTag } from '../../../features/purchases/db/cache';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Suspense } from 'react';
import UserPurchaseTable, { UserPurchaseTableSkeleton } from '../../../features/purchases/components/UserPurchaseTable';
import { getCurrentUser } from '../../../services/clerk';
import { sleep } from '../../../lib/utils';

export default async function PurchasesPage(
) {
  return (
    <div className='container my-6'>
      <PageHeader title='Purchase History' />
      <Suspense fallback={<UserPurchaseTableSkeleton />}>
        <SuspenseBoundary />
      </Suspense>
    </div>
  );
};

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) {
    return redirectToSignIn();
  }

  const userPurchases = await getUserPurchases(userId);
  // await sleep(600);

  if (userPurchases.length === 0) {
    return (
      <div className='flex flex-col gap-2 items-start'>
        <PageHeader title='No purchases found' />
        <Button asChild size='lg'>
          <Link href='/'>Browse courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <UserPurchaseTable purchases={userPurchases} />
  );
}

async function getUserPurchases(userId: string) {
  'use cache';
  cacheTag(getPurchaseUserTag(userId));

  const userPurchases = await db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: eq(PurchaseTable.userId, userId),
    orderBy: asc(PurchaseTable.updatedAt),
  });

  return userPurchases;
}
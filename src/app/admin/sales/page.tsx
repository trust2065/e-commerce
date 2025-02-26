import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getPurchaseGlobalTag } from '../../../features/purchases/db/cache';
import { getUserGlobalTag } from '../../../features/users/db/cache';
import { desc } from 'drizzle-orm';
import { PurchaseTable as DbPurchaseTable } from '../../../drizzle/schema';
import { db } from '../../../drizzle/db';
import { PageHeader } from '../../../components/PageHeader';
import { PurchaseTable } from '../../../features/purchases/components/PurchasTable';

export default async function SalesPage() {
  const purchases = await getPurchases();

  return (
    <div className='container mt-6'>
      <PageHeader title='Sales' />
      <PurchaseTable purchases={purchases} />
    </div>
  );
};


async function getPurchases() {
  'use cache';
  cacheTag(getPurchaseGlobalTag(), getUserGlobalTag());

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    orderBy: desc(DbPurchaseTable.createdAt),
    with: {
      user: {
        columns: {
          name: true,
        }
      }
    }
  });
}
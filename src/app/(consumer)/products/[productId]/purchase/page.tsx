import { Suspense } from 'react';
import { PageHeader } from '../../../../../components/PageHeader';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getProductIdTag } from '../../../../../features/products/db/cache';
import { db } from '../../../../../drizzle/db';
import { and, eq } from 'drizzle-orm';
import { ProductTable } from '../../../../../drizzle/schema';
import { wherePublicProducts } from '../../../../../features/products/permissions/products';
import { getCurrentUser } from '../../../../../services/clerk';
import { notFound, redirect } from 'next/navigation';
import { userOwnsProduct } from '../../../../../features/products/db/products';
import { SignIn } from '@clerk/nextjs';
import StripeCheckoutForm from '../../../../../services/stripe/components/StripeCheckoutForm';

export default function PurchasePage({
  params,
}: {
  params: Promise<{ productId: string; }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner className='my-6 size-36 mx-auto' />}>
      <SuspendedComponent params={params} />
      <div className='container my-6 flex flex-col' >
        <PageHeader title='Purchase' />
      </div>
    </Suspense>
  );
}

async function SuspendedComponent({
  params,
}: {
  params: Promise<{ productId: string; }>;
}) {
  const { productId } = await params;
  const { user } = await getCurrentUser({ allData: true });
  const product = await getPublicProduct(productId);

  if (product == null) {
    return notFound();
  }

  if (user != null) {
    if (await userOwnsProduct(user.id, product.id)) {
      redirect('/courses');
    }

    return (
      <div className='container my-6'>
        <StripeCheckoutForm product={product} user={user} />
      </div>
    );
  }

  return (
    <div className='container my-6 flex flex-col items-center'>
      <PageHeader title='Sign in to purchase' />
      <SignIn
        routing='hash'
        forceRedirectUrl={`/products/${productId}/purchase`}
      />
    </div>
  );
}

async function getPublicProduct(productId: string) {
  'use cache';
  cacheTag(getProductIdTag(productId));

  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      priceInDollars: true,
    },
    where: and(eq(ProductTable.id, productId), wherePublicProducts)
  });

  return product;
}
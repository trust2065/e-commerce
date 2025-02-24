import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getProductIdTag } from '../../../../../../features/products/db/cache';
import { db } from '../../../../../../drizzle/db';
import { and, eq } from 'drizzle-orm';
import { ProductTable } from '../../../../../../drizzle/schema';
import { wherePublicProducts } from '../../../../../../features/products/permissions/products';
import { Button } from '../../../../../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ProductPurchaseSuccessPage({
  params,
}: {
  params: Promise<{ productId: string; }>;
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (product == null) {
    return notFound();
  }

  return (
    <div className='container my-6'>
      <div className='flex gap-16 items-center justify-between'>
        <div className='flex flex-col gap-4 items-center'>
          <div className='text-3xl font-semibold'>
            Purchase Successful
          </div>
          <div className='text-xl'>
            Thank you for buying {"'"}{product.name}{"'"}
          </div>
          <Button asChild className='text-xl h-auto py-4 px-8 rounded-lg'>
            <Link href='/courses'>View my courses</Link>
          </Button>
        </div>
        <div className='relative aspect-video max-w-lg flex-grow'>
          <Image
            src={product.imageUrl}
            alt={product.name}
            className='object-cover rounded-lg'
            fill
          />
        </div>
      </div>
    </div>
  );
}

async function getPublicProduct(productId: string) {
  'use cache';
  cacheTag(getProductIdTag(productId));

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      imageUrl: true,
    },
    where: and(
      eq(ProductTable.id, productId),
      wherePublicProducts
    )
  });
}
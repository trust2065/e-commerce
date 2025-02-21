import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getProductGlobalTag } from '../../features/products/db/cache';
import { db } from '../../drizzle/db';
import { asc } from 'drizzle-orm';
import { ProductTable } from '../../drizzle/schema';
import { wherePublicProducts } from '../../features/products/permissions/products';
import { ProductCard } from '../../features/products/components/ProductCard';

export default async function Page() {
  const products = await getPublicProducts();
  console.log('ids');
  console.log(products.map(p => p.id));

  return (
    <div className='container my-6'>
      hi
      { }
      <div className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}

async function getPublicProducts() {
  'use cache';
  cacheTag(getProductGlobalTag());

  return db.query.ProductTable.findMany({
    columns: {
      id: true,
      name: true,
      priceInDollars: true,
      imageUrl: true,
      description: true,
    },
    where: wherePublicProducts,
    orderBy: asc(ProductTable.name),
  });
}
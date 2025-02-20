import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getProductIdTag } from '../../../../../features/products/db/cache';
import { CourseTable, ProductTable } from '../../../../../drizzle/schema';
import { PageHeader } from '../../../../../components/PageHeader';
import { ProductForm } from '../../../../../features/products/components/ProductForm';
import { db } from '../../../../../drizzle/db';
import { getCourseGlobalTag } from '../../../../../features/courses/db/cache/courses';

export default async function EditProductPage({
  params
}: {
  params: Promise<{ productId: string; }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);
  const courses = await getCourses();

  if (product == null) {
    return notFound();
  }

  return (
    <div className='container my-6'>
      <PageHeader title='Edit Product'></PageHeader>
      <ProductForm product={{
        ...product,
        courseIds: product.courseProducts.map(cp => cp.courseId)
      }} courses={courses} />
    </div>
  );
}

async function getCourses() {
  'use cache';
  cacheTag(getCourseGlobalTag());

  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  });
}

async function getProduct(productId: string) {
  'use cache';
  cacheTag(getProductIdTag(productId));

  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      priceInDollars: true,
      status: true,
    },
    where: eq(ProductTable.id, productId),
    with: {
      courseProducts: {
        columns: {
          courseId: true
        }
      }
    }
  });
}
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { PageHeader } from '../../../../components/PageHeader';
import { getCourseGlobalTag } from '../../../../features/courses/db/cache/courses';
import { ProductForm } from '../../../../features/products/components/ProductForm';
import { db } from '../../../../drizzle/db';
import { asc } from 'drizzle-orm';
import { CourseTable } from '../../../../drizzle/schema';

export default async function NewProductPage() {
  const courses = await getCourses();

  return (
    <div className='container my-6'>
      <PageHeader title='New Product'></PageHeader>
      <ProductForm courses={courses}  />
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
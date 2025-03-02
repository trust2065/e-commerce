import { db } from '../../../../drizzle/db';
import { and, asc, eq } from 'drizzle-orm';
import { CourseSectionTable, LessonTable, ProductTable } from '../../../../drizzle/schema';
import { notFound } from 'next/navigation';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getProductIdTag } from '../../../../features/products/db/cache';
import { wherePublicProducts } from '../../../../features/products/permissions/products';
import { wherePublicCourseSections } from '../../../../features/courseSections/permissions/sections';
import { wherePublicLessons } from '../../../../features/lessons/permissions/lessons';
import { getLessonCourseTag } from '../../../../features/lessons/db/cache/lessons';
import { getCourseSectionCourseTag } from '../../../../features/courseSections/db/cache';
import { getCourseIdTag } from '../../../../features/courses/db/cache/courses';
import { sumArray } from '../../../../lib/sumArray';
import { formatPlural } from '../../../../lib/formatters';
import { Suspense } from 'react';
import { getCurrentUser } from '../../../../services/clerk';
import { userOwnsProduct } from '../../../../features/products/db/products';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import { SkeletonButton } from '../../../../components/Skeleton';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../../components/ui/accordion';
import { VideoIcon } from 'lucide-react';

export default async function ProductPage({
  params,
}: {
  params: {
    productId: string;
  };
}) {
  const { productId } = await params;
  const product = await getPublicProduct(productId);

  if (product == null) {
    return notFound();
  }

  const courseCount = product.courses.length;
  const lessonCount = sumArray(product.courses, c => (
    sumArray(c.courseSections, cs => (
      cs.lessons.length
    ))
  ));

  return (
    <div className='container my-6 flex flex-col' >
      <div className='flex gap-16 items-center justify-between'>
        <div className='flex flex-col items-start gap-4'>
          <div className='flex flex-col gap-2'>
            <div className='text-xl'>${product.priceInDollars}</div>
            <h1 className='text-4xl font-semibold'>
              {product.name}
            </h1>
            <div className='text-muted-foreground'>
              {formatPlural(courseCount, {
                singular: 'course',
                plural: 'courses'
              })} -
              {formatPlural(lessonCount, {
                singular: 'lesson',
                plural: 'lessons'
              })}
            </div>
          </div>
          <div className='text-xl'>
            {product.description}
          </div>
          <Suspense fallback={<SkeletonButton className="h-12 w-36" />}>
            <PurchaseButton productId={product.id} />
          </Suspense>
        </div>
        <div className='relative aspect-video max-w-xs flex-grow'>
          <Image src={product.imageUrl} alt={product.name} fill className='object-cover rounded-xl' />
        </div>
      </div>
      <div className='grid grid-cols-1 lg-grid-cols-2 gap-8 mt-8 items-start'>
        {product.courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>
                {course.name}
              </CardTitle>
              <CardDescription>
                {
                  formatPlural(course.courseSections.length, { singular: 'section', plural: 'sections' })} - {
                  formatPlural(sumArray(course.courseSections, cs => cs.lessons.length), { singular: 'lesson', plural: 'lessons' })
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type='multiple'>
                {course.courseSections.map(section => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className='flex gap-2'>
                      <div className='flex-flex-col flex-grow'>
                        <span className='text-lg'>{section.name}</span>
                        <div className='text-muted-foreground'>
                          {formatPlural(section.lessons.length, { singular: 'lesson', plural: 'lessons' })}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='flex flex-col gap-2'>
                      {section.lessons.map(lesson => (
                        <div key={lesson.id} className='flex items-center text-base gap-2'>
                          <VideoIcon className='size-4' />
                          {lesson.status === 'preview' ? (
                            <Link className='underline text-accent' href={`/courses/${course.id}/lessons/${lesson.id}`}>{lesson.name}</Link>
                          ) : (
                            lesson.name
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function PurchaseButton({ productId }: { productId: string; }) {
  const { userId } = await getCurrentUser();
  const alreadyOwnsProduct = userId != null && userOwnsProduct(userId, productId);

  if (alreadyOwnsProduct) {
    return (
      <p>You already own this product</p>
    );
  } else {
    return (
      <Button className='text-xl h-auto py-4 px-8 rounded-lg' asChild>
        <Link href={`/products/${productId}/purchase`}>Get Now</Link>
      </Button>
    );
  }

  return (
    <button className='btn'>Purchase</button>
  );
}

async function getPublicProduct(productId: string) {
  'use cache';
  cacheTag(getProductIdTag(productId));

  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: and(eq(ProductTable.id, productId), wherePublicProducts),
    with: {
      courseProducts: {
        columns: {},
        with: {
          course: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              courseSections: {
                columns: {
                  id: true,
                  name: true
                },
                where: wherePublicCourseSections,
                orderBy: asc(CourseSectionTable.order),
                with: {
                  lessons: {
                    columns: {
                      id: true,
                      name: true,
                      status: true,
                    },
                    where: wherePublicLessons,
                    orderBy: asc(LessonTable.order),
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (product == null) {
    return product;
  }

  cacheTag(
    ...product.courseProducts.flatMap(cp => {
      return [
        getLessonCourseTag(cp.course.id),
        getCourseSectionCourseTag(cp.course.id),
        getCourseIdTag(cp.course.id),
      ];
    })
  );

  // just a rename, we can use 'courses' instead of 'courseProducts'
  const { courseProducts, ...others } = product;

  return {
    ...others,
    courses: courseProducts.map(cp => cp.course),
  };
}
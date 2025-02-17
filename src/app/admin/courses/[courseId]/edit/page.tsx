import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getCourseIdTag } from '../../../../../features/courses/db/cache/courses';
import { getCourseSectionCourseTag } from '../../../../../features/courseSections/db/cache';
import { getLessonCourseTag } from '../../../../../features/lessons/db/cache/lessons';
import { db } from '../../../../../drizzle/db';
import { asc, eq } from 'drizzle-orm';
import { CourseSectionTable, CourseTable, LessonTable } from '../../../../../drizzle/schema';
import { notFound } from 'next/navigation';
import { PageHeader } from '../../../../../components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { Card, CardHeader } from '../../../../../components/ui/card';
import { CourseForm } from '../../../../../features/courses/components/CourseForm';

export default async function EditCoursePage({ params }: { params: { courseId: string; }; }) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) {
    return notFound();
  }

  return (
    <div className='container my-6'>
      <PageHeader title={course.name} />
      <Tabs defaultValue='lessons'>
        <TabsList>
          <TabsTrigger value='lessons'>Lessons</TabsTrigger>
          <TabsTrigger value='details'>Details</TabsTrigger>
        </TabsList>
        <TabsContent value='lessons'>
          Lessons
        </TabsContent>
        <TabsContent value='details'>
          <Card>
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getCourse(id: string) {
  'use cache';
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
    },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: {
          id: true,
          status: true,
          name: true,
        },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              status: true,
              name: true,
              description: true,
              youtubeVideoId: true,
              sectionId: true,
            }
          }
        }
      }
    }
  });
}
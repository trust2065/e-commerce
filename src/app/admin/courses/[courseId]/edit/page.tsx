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
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { CourseForm } from '../../../../../features/courses/components/CourseForm';
import SectionFormDialog from '../../../../../features/courseSections/components/SectionFormDialog';
import { DialogTrigger } from '../../../../../components/ui/dialog';
import { Button } from '../../../../../components/ui/button';
import { EyeClosedIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { cn } from '../../../../../lib/utils';
import { ActionButton } from '../../../../../components/ActionButton';
import { deleteSection } from '../../../../../features/courseSections/actions/sections';

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
          <Card>
            <CardHeader className='flex items-center flex-row justify-between'>
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog courseId={courseId}>
                <DialogTrigger asChild>
                  <Button variant='outline'>
                    <PlusIcon /> New Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              {course.courseSections.map((section) => {
                const isPrivate = section.status === 'private';

                return (
                  <div key={section.id} className='flex items-center gap-1'>
                    <div className={cn('contents', isPrivate && 'text-muted-foreground')}>
                      {isPrivate && <EyeClosedIcon className='size-3' />}
                      {section.name}
                    </div>
                    <SectionFormDialog section={section} courseId={courseId}>
                      <DialogTrigger asChild>
                        <Button variant='outline' size='sm' className='ml-auto'>
                          Edit
                        </Button>
                      </DialogTrigger>
                    </SectionFormDialog>
                    <ActionButton action={deleteSection.bind(null, section.id)} requireAreYouSure variant='destructiveOutline' size='sm'>
                      <Trash2Icon />
                    </ActionButton>
                  </div>
                );
              })}
            </CardContent>
          </Card>
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
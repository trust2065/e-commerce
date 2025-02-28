import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getCurrentUser } from '../../../services/clerk';
import { getUserCourseAccessUserTag } from '../../../features/courses/db/cache/userCourseAccess';
import { db } from '../../../drizzle/db';
import { and, countDistinct, eq } from 'drizzle-orm';
import { CourseSectionTable, CourseTable, LessonTable, UserCourseAccessTable, UserLessonCompleteTable } from '../../../drizzle/schema';
import { PageHeader } from '../../../components/PageHeader';
import { SkeletonCourseCard, UserCourseGrid } from '../../../features/courses/components/UserCourseGrid';
import { Suspense } from 'react';
import { wherePublicCourseSections } from '../../../features/courseSections/permissions/sections';
import { wherePublicLessons } from '../../../features/lessons/permissions/lessons';
import { getUserLessonCompleteUserTag } from '../../../features/lessons/db/cache/lessonComplete';
import { getCourseIdTag } from '../../../features/courses/db/cache/courses';
import { getCourseSectionCourseTag } from '../../../features/courseSections/db/cache';
import { getLessonCourseTag } from '../../../features/lessons/db/cache/lessons';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import { SkeletonArray } from '../../../components/Skeleton';

// this page should show a list of courses that the user owns
export default async function CoursesPage() {
  return (
    <div className='container my-6'>
      <PageHeader title='My Courses' />
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid:cols-3 gap-4'>
        <Suspense fallback={
          <SkeletonArray amount={3} >
            <SkeletonCourseCard />
          </SkeletonArray>
        }
        >
          <SuspenseBoundary />
        </Suspense>
      </div>
    </div>
  );
};

async function SuspenseBoundary() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) {
    return redirectToSignIn();
  }

  const courses = await getUserCourses(userId);

  if (courses.length === 0) {
    return (
      <div className='flex flex-col gap-2 items-start'>
        You have no courses

        <Button asChild size='lg'>
          <Link href=''>Browse courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <UserCourseGrid courses={courses} />
  );
}

async function getUserCourses(userId: string) {
  'use cache';
  cacheTag(
    getUserCourseAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId)
  );

  const courses = await db.select({
    id: CourseTable.id,
    name: CourseTable.name,
    description: CourseTable.description,
    sectionsCount: countDistinct(CourseSectionTable.id),
    lessonsCount: countDistinct(LessonTable.id),
    lessonsComplete: countDistinct(UserLessonCompleteTable.lessonId),
  })
    .from(CourseTable)
    .leftJoin(UserCourseAccessTable, and(
      eq(UserCourseAccessTable.courseId, CourseTable.id),
      eq(UserCourseAccessTable.userId, userId)
    ))
    .leftJoin(CourseSectionTable, and(
      eq(CourseSectionTable.courseId, CourseTable.id),
      wherePublicCourseSections
    ))
    .leftJoin(LessonTable, and(
      eq(LessonTable.sectionId, CourseSectionTable.id),
      wherePublicLessons
    ))
    .leftJoin(UserLessonCompleteTable, and(
      eq(UserLessonCompleteTable.lessonId, LessonTable.id),
      eq(UserLessonCompleteTable.userId, userId),
    ))
    .where(eq(UserCourseAccessTable.userId, userId))
    .groupBy(CourseTable.id)
    .orderBy(CourseTable.name);

  // const userCourses = await db.query.UserCourseAccessTable.findMany({
  //   columns: {
  //     createdAt: true,
  //   },
  //   where: eq(UserCourseAccessTable.userId, userId),
  //   with: {
  //     course: {
  //       columns: {
  //         id: true,
  //         name: true,
  //         description: true,
  //       }
  //     }
  //   }
  // });

  // revalidate ONLY the courses that is returning
  courses.forEach(course => {
    cacheTag(
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id),
    );
  });

  return courses;
}
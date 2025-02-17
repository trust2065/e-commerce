'use server';

import { z } from 'zod';
import { courseSchema } from '../schema/courses';
import { redirect } from 'next/navigation';
import { canCreateCourse as canCreateCourses, canDeleteCourses } from '../permissions/courses';
import { deleteCourse as deleteCourseDB, insertCourse } from '../db/courses';
import { getCurrentUser } from '../../../services/clerk';

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid data when creating your course'
    };
  }

  if (!canCreateCourses(await getCurrentUser())) {
    return {
      error: true,
      message: 'You do not have permission to create a course'
    };
  }

  const course = await insertCourse(data);

  redirect(`/admin/courses/${course.id}/edit`);
}

export async function deleteCourse(id: string) {
  if (!canDeleteCourses(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error deleting your course',
    };
  }

  await deleteCourseDB(id);

  return {
    error: false,
    message: 'Successfully deleted course'
  };
}
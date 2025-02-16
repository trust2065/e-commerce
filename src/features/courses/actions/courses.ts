'use server';

import { z } from 'zod';
import { courseSchema } from '../schema/courses';
import { redirect } from 'next/navigation';
import { canCreateCourse } from '../permissions/courses';
import { insertCourse } from '../db/courses';
import { getCurrentUser } from '../../../services/clerk';

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid data when creating your course'
    };
  }

  if (!canCreateCourse(await getCurrentUser())) {
    return {
      error: true,
      message: 'You do not have permission to create a course'
    };
  }

  const course = await insertCourse(data);

  redirect(`/admin/courses/${course.id}/edit`);
}
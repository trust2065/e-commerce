'use server';

import { z } from 'zod';
import { courseSchema } from '../schema/courses';
import { redirect } from 'next/navigation';
import { canCreateCourse as canCreateCourses, canDeleteCourses, canUpdateCourses } from '../permissions/courses';
import {updateCourse as updateCourseDb, deleteCourse as deleteCourseDb, insertCourse } from '../db/courses';
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

export async function updateCourse(id: string,unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: 'Invalid data when updating your course'
    };
  }

  if (!canUpdateCourses(await getCurrentUser())) {
    return {
      error: true,
      message: 'You do not have permission to update a course'
    };
  }

  const course = await updateCourseDb(id, data);

  redirect(`/admin/courses/${course.id}/edit`);
}

export async function deleteCourse(id: string) {
  if (!canDeleteCourses(await getCurrentUser())) {
    return {
      error: true,
      message: 'Error deleting your course',
    };
  }

  await deleteCourseDb(id);

  return {
    error: false,
    message: 'Successfully deleted course'
  };
}
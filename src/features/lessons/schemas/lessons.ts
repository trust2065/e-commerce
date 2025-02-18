import { z } from 'zod';
import { lessonStatusEnum } from '../../../drizzle/schema';

export const lessonSchema = z.object({
  name: z.string().min(1, 'Required'),
  status: z.enum(lessonStatusEnum.enumValues),
  youtubeVideoId: z.string().min(1, 'Required'),
  description: z
    .string()
    .transform(v => v === '' ? null : v)
    .nullable(),
  sectionId: z.string().min(1, 'Required'),
});
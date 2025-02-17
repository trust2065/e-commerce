import { z } from 'zod';
import { courseSectionStatuses } from '../../../drizzle/schema';

export const sectionSchema = z.object({
  name: z.string().min(1, 'Required'),
  status: z.enum(courseSectionStatuses)
});
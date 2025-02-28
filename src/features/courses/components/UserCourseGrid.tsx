
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { formatPlural } from '../../../lib/formatters';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { SkeletonButton, SkeletonText } from '../../../components/Skeleton';

export function UserCourseGrid({ courses }: {
  courses: {
    id: string;
    name: string;
    sectionsCount: number;
    lessonsCount: number;
    lessonsComplete: number;
    description: string;
  }[];
}) {
  return (
    <>
      {courses.map((course) => (
        <Card key={course.id} className='overflow-hidden flex flex-col'>
          <CardHeader>
            <CardTitle>
              <div className='flex flex-col gap-1'>
                <div className='font-semibold'>{course.name}</div>
              </div>
            </CardTitle>
            <CardDescription>
              <div className='text-muted-foreground'>
                {formatPlural(course.sectionsCount, { singular: 'section', plural: 'sections' })}{' '} - {' '}
                {formatPlural(course.lessonsCount, { singular: 'lesson', plural: 'lessons' })}
              </div>
            </CardDescription>
          </CardHeader >
          <CardContent>
            <div className='line-clamp-3' title={course.description}>
              {course.description}
            </div>
          </CardContent>

          {/* expand area to make each course has the same height */}
          <div className='flex-grow' />

          <CardFooter>
            <Button asChild size='lg'>
              <Link href={`/courses/${course.id}`}>View course</Link>
            </Button>
          </CardFooter>
          <div className='bg-accent h-2 -mt-2' style={{ width: `${(course.lessonsComplete / course.lessonsCount) * 100}%` }} />
        </Card>
      ))}
    </>
  );
}

export function SkeletonCourseCard() {
  return (
    <Card className='animate-pulse'>
      <CardHeader>
        <CardTitle>
          <SkeletonText className='w-3/4' />
        </CardTitle>
        <CardDescription>
          <SkeletonText className='w-1/2' />
        </CardDescription>
      </CardHeader >
      <CardContent>
        <SkeletonText rows={3} className='w-1/3' />
      </CardContent>

      <CardFooter>
        <SkeletonButton />
      </CardFooter>
    </Card>
  );
}


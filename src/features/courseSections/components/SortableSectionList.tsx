'use client';

import { EyeClosedIcon, Trash2Icon } from 'lucide-react';
import { ActionButton } from '../../../components/ActionButton';
import { SortableItem, SortableList } from '../../../components/SortableList';
import { Button } from '../../../components/ui/button';
import { CourseSectionStatus } from '../../../drizzle/schema';
import { cn } from '../../../lib/utils';
import { deleteSection, updateSectionOrders } from '../actions/sections';
import SectionFormDialog from './SectionFormDialog';
import { DialogTrigger } from '../../../components/ui/dialog';

export function SortableSectionList({ courseId, sections }: {
  courseId: string;
  sections: {
    id: string;
    name: string;
    status: CourseSectionStatus;
  }[];
}) {

  return (
    <SortableList items={sections} onOrderChange={updateSectionOrders}>
      {items => items.map(section => {
        const isPrivate = section.status === 'private';

        return (
          <SortableItem key={section.id} id={section.id} className='flex items-center gap-1'>
            <div className={cn('contents', isPrivate && 'text-muted-foreground')}>
              {isPrivate && <EyeClosedIcon className='size-3' />}
              {section.name}
            </div>
            <SectionFormDialog section={section} courseId={courseId}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='ml-auto' >
                  Edit
                </Button>
              </DialogTrigger>
            </SectionFormDialog>
            <ActionButton action={deleteSection.bind(null, section.id)} requireAreYouSure variant='destructiveOutline' size='sm'>
              <Trash2Icon />
            </ActionButton>
          </SortableItem>
        );
      })}
    </SortableList>
  );
}
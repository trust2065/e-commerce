import { Loader2Icon } from 'lucide-react';
import { cn } from '../lib/utils';

export function LoadingSpinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>) {
  return (
    <Loader2Icon
      className={cn('animate-spin text-accent', className)}
      {...props}
    />
  );
}
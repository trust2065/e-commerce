import Link from 'next/link';
import { Button } from '../../../../components/ui/button';

export default function ProductPurchaseFailurePage() {
  return (
    <div className='container my-6'>
      <div className='flex flex-col gap-4 items-center'>
        <div className='text-3xl font-semibold'>
          Purchase Failed
        </div>
        <div className='text-xl'>
          There was an error processing your payment.
        </div>
        <Button asChild className='text-xl h-auto py-4 px-8 rounded-lg'>
          <Link href='/'>Try again</Link>
        </Button>
      </div>
    </div>
  );
}
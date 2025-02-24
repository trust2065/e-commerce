import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import { formatDate, formatPrice } from '../../../lib/formatter';
import { Badge } from '../../../components/ui/badge';
import { SkeletonArray, SkeletonButton, SkeletonText } from '../../../components/Skeleton';

export default function UserPurchaseTable({
  purchases
}: {
  purchases: {
    id: string;
    createdAt: Date;
    pricePaidInCents: number;
    productDetails: {
      name: string;
      description: string;
      imageUrl: string;
    };
    refundedAt: Date | null;
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map(purchase => (
          <TableRow key={purchase.id}>
            <TableCell>
              <div className='flex gap-4 items-center'>
                <Image src={purchase.productDetails.imageUrl} alt={purchase.productDetails.name} className='size-12 object-fill rounded' width={192} height={192} />
                <div className='flex flex-col gap-1 font-semibold'>
                  <div>{purchase.productDetails.name}</div>
                  <div className='text-muted-foreground text-xs'>
                    {purchase.refundedAt
                      ? <Badge variant={'outline'}>Refunded</Badge>
                      : formatDate(purchase.createdAt)
                    }
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {formatPrice(purchase.pricePaidInCents / 100)}
            </TableCell>
            <TableCell>
              <div className='flex gap-2'>
                <Button variant={'outline'} asChild>
                  <Link href={`/purchases/${purchase.id}`} >Details</Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function UserPurchaseTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <SkeletonArray amount={3}>
          <TableRow>
            <TableCell>
              <div className="flex items-center gap-4">
                <div className="size-12 bg-secondary animate-pulse rounded" />
                <div className="flex flex-col gap-1">
                  <SkeletonText className="w-36" />
                  <SkeletonText className="w-3/4" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <SkeletonText className="w-12" />
            </TableCell>
            <TableCell>
              <SkeletonButton />
            </TableCell>
          </TableRow>
        </SkeletonArray>
      </TableBody>
    </Table>
  );
}
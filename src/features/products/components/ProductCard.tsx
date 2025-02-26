import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Suspense } from 'react';
import { formatPrice } from '../../../lib/formatters';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';

export function ProductCard({
  id,
  name,
  imageUrl,
  description,
  priceInDollars,
}: {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  priceInDollars: number;
}) {
  return (
    <Card className='overflow-hidden flex flex-col w-full max-w-[500px] mx-auto'>
      <div className='relative aspect-video w-full'>
        <Image
          src={imageUrl}
          alt={name}
          fill
          className='object-cover'
        />
      </div>
      <CardHeader className='space-y-0'>
        <CardDescription>
          <Suspense fallback={formatPrice(priceInDollars)}>
            <Price price={priceInDollars} />
          </Suspense>
        </CardDescription>
        <CardTitle className='text-xl'>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='line-clamp-3'>
          {description}
        </p>
      </CardContent>
      <CardFooter className='mt-auto'>
        <Button className='w-full text-md py-6' asChild>
          <Link href={`/products/${id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// actual price(ignore ppp for now)
async function Price({ price }: { price: number; }) {
  return (
    <div className='flex items-baseline gap-2'>
      ${price}
    </div>
  );
}
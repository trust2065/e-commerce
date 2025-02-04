import { SignedIn } from '@clerk/nextjs';
import Link from 'next/link';
import { ReactNode, Suspense } from 'react';

export default function ConsumerLayout({
  children
}: Readonly<{ children: ReactNode; }>) {
  return (
    <>
      <Navbar />
      {children}
    </>

  );
}


function Navbar() {
  return (
    <header className='flex h-12 shadow bg-background z-10'>
      <nav className='flex gap-4 container'>
        <Link className='mr-auto text-lg hover:underline flex items-center px-2' href="/">Link</Link>
        {/* for this next.js canary version */}
        <Suspense>
          <Link className='hover:bg-accent/10 flex items-center px-2' href='/courses'>My course</Link>
          <Link className='hover:bg-accent/10 flex items-center px-2' href='/purchases'>Purchase History </Link>
          <SignedIn>
          </SignedIn>
        </Suspense>
      </nav>
    </header>
  );
}
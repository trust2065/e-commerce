import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ReactNode, Suspense } from 'react';
import { Button } from '../../components/ui/button';
import { getCurrentUser } from '../../services/clerk';
import { canAccessAdminPages } from '../../permissions/general';

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
        <Link className='mr-auto text-lg hover:underline flex items-center' href="/">Link</Link>
        {/* for this next.js canary version */}
        <Suspense>
          <SignedIn>
            <AdminLink />
            <Link className='hover:bg-accent/10 flex items-center px-2' href='/courses'>My course</Link>
            <Link className='hover:bg-accent/10 flex items-center px-2' href='/purchases'>Purchase History </Link>
            <div className='size-8 self-center'>
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: '100%', height: '100%'
                  }
                }
              }} />
            </div>
          </SignedIn>
        </Suspense>
        <Suspense>
          <SignedOut>
            <Button className='self-center' asChild>
              <Link href='sign-in'>Sign in</Link>
            </Button>
          </SignedOut>
        </Suspense>
      </nav>
    </header>
  );
}

async function AdminLink() {
  const user = await getCurrentUser({ allData: true });
  if (!canAccessAdminPages(user)) {
    return null;
  }

  return (
    <Link className='hover:bg-accent/10 flex items-center px-2' href='/admin'>Admin</Link>
  );
}
export default async function AuthLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    // <div className='min-h-screen flex flex-col justify-center items-center'>
    <div>
      {children}
    </div>
  );
}
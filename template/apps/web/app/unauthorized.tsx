import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className='flex flex-col items-center justify-center min-h-screen bg-bakcground px-4'>
      <h1 className='text-4xl font-bold text-red-600 mb-4'>
        401 - Unauthorized
      </h1>
      <p className='text-lg text-gray-700 mb-6'>
        Please log in to access this page.
      </p>
      <Link
        href='/auth/signin'
        className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
      >
        Login
      </Link>
    </main>
  );
}

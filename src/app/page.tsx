'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  router.push('/manage-imports');
  
  return <main></main>;
}

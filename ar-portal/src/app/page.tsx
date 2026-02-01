import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard (will be protected and redirect to login if not authenticated)
  redirect('/dashboard');
}

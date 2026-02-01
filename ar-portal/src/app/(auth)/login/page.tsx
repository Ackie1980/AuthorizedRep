import { LoginForm } from '@/components/auth';
import Link from 'next/link';

interface LoginPageProps {
  searchParams: { callbackUrl?: string };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>
      <LoginForm callbackUrl={searchParams.callbackUrl} />
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}

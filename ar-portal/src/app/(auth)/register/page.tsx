import { RegisterForm } from '@/components/auth';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>
      <RegisterForm />
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

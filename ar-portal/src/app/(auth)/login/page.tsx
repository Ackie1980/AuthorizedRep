import { LoginForm } from '@/components/auth';
import Link from 'next/link';

interface LoginPageProps {
  searchParams: { callbackUrl?: string };
}

const devAccounts = [
  { email: 'admin@arservices.eu', role: 'Admin' },
  { email: 'expert@arservices.eu', role: 'EC Rep Expert' },
  { email: 'john.smith@acmemedical.com', role: 'Customer' },
  { email: 'h.mueller@biotechdevices.de', role: 'Customer' },
];

export default function LoginPage({ searchParams }: LoginPageProps) {
  const isDev = process.env.NODE_ENV === 'development';

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

      {isDev && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-dashed">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Dev Test Accounts
          </p>
          <div className="space-y-2">
            {devAccounts.map((account) => (
              <div key={account.email} className="text-xs flex justify-between items-center">
                <code className="bg-background px-2 py-1 rounded">{account.email}</code>
                <span className="text-muted-foreground">{account.role}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Password: <code className="bg-background px-2 py-1 rounded">password123</code>
          </p>
        </div>
      )}
    </div>
  );
}

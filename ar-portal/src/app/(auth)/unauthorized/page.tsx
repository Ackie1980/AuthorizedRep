import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="text-center">
      <ShieldX className="mx-auto h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
      <p className="mt-2 text-muted-foreground">
        You don&apos;t have permission to access this page.
      </p>
      <div className="mt-6 space-x-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

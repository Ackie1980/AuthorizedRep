import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

function formatRole(role: string): string {
  return role.split('_').map(word =>
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
}

function formatDate(date: Date | null): string {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch full user details with manufacturer
  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    include: {
      manufacturer: {
        select: {
          id: true,
          name: true,
          legalName: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  First Name
                </label>
                <p className="text-base">{user.firstName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Last Name
                </label>
                <p className="text-base">{user.lastName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-base">{user.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <div>
                  <Badge variant="outline" className="font-normal">
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </label>
                <div>
                  <Badge variant={user.isActive ? 'default' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <p className="text-base">{formatDate(user.lastLoginAt)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Account Created
                </label>
                <p className="text-base">{formatDate(user.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-base">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manufacturer Information (for CUSTOMER role) */}
        {user.manufacturer && (
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Information</CardTitle>
              <CardDescription>
                Your associated manufacturer details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Manufacturer Name
                  </label>
                  <p className="text-base">{user.manufacturer.name}</p>
                </div>

                {user.manufacturer.legalName && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Legal Name
                    </label>
                    <p className="text-base">{user.manufacturer.legalName}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div>
                    <Badge
                      variant={
                        user.manufacturer.status === 'ACTIVE' ? 'default' :
                        user.manufacturer.status === 'SUSPENDED' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {formatRole(user.manufacturer.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
            <CardDescription>
              Information about your account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-muted bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  For security reasons, password changes and account modifications
                  are handled by your system administrator. If you need to update
                  your credentials or account details, please contact support.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

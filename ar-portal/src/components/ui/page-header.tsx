import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  children?: ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          {description && (
            <p className="text-base text-gray-500">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
      <Separator className="mt-6" />
    </div>
  );
}

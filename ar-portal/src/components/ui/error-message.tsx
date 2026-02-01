import { AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex rounded-full bg-red-100 p-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

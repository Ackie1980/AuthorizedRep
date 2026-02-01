'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export function FormField({
  name,
  label,
  description,
  required,
  children,
  className,
}: FormFieldProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  // Clone the child element and pass the necessary props
  const childWithProps = React.cloneElement(children, {
    id: name,
    name,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : description ? `${name}-description` : undefined,
  });

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}
      {description && (
        <p id={`${name}-description`} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      {childWithProps}
      {errorMessage && (
        <p
          id={`${name}-error`}
          className="text-sm font-medium text-red-600"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

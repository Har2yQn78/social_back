import type { ReactNode } from 'react';
import type { FieldErrors, FieldError, UseFormReturn } from 'react-hook-form';
import { cn } from '../../lib/cn';

export function Form({
  children,
  className,
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn('space-y-4', className)} {...props}>
      {children}
    </form>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  help,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  help?: string | ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : help ? (
        <p className="text-sm text-neutral-500">{help}</p>
      ) : null}
    </div>
  );
}

export function getError<T extends Record<string, unknown>>(
  errors: FieldErrors<T>,
  name: keyof T
): string | undefined {
  const err = errors[name] as FieldError | undefined;
  if (!err) return undefined;
  return typeof err.message === 'string' ? err.message : 'Invalid value';
}

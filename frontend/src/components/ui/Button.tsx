import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'approval' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-ds-gray-1000 text-ds-background-100 hover:bg-ds-gray-1000/90 ds-shadow-border',
      secondary: 'bg-ds-blue-700 text-ds-background-100 hover:bg-ds-blue-800 ds-shadow-border',
      approval: 'bg-ds-amber-700 text-ds-gray-1000 hover:bg-ds-amber-700/90 ds-shadow-border',
      ghost: 'bg-transparent text-ds-blue-700 hover:bg-ds-blue-700/5',
      outline: 'bg-ds-background-100 border border-ds-gray-200 text-ds-gray-1000 hover:border-ds-gray-1000 hover:bg-ds-background-200 ds-shadow-border',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-geist font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ds-blue-700/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

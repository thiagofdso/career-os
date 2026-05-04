import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'agent' | 'priority' | 'success' | 'warning' | 'error';
  className?: string;
  color?: string; // For agent specific colors
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className, color }) => {
  const variants = {
    default: 'bg-ds-gray-100 text-ds-gray-900',
    outline: 'border border-ds-gray-200 text-ds-gray-700',
    agent: `${color || 'bg-ds-gray-1000'} text-ds-background-100`,
    priority: 'bg-ds-blue-700/10 text-ds-blue-700 border border-ds-blue-700/20',
    success: 'bg-ds-green-900/10 text-ds-green-900 border border-ds-green-900/20',
    warning: 'bg-ds-amber-700/20 text-ds-amber-900 border border-ds-amber-700/30',
    error: 'bg-ds-red-900/10 text-ds-red-900 border border-ds-red-900/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-geist px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'income' | 'expense' | 'transfer' | 'outline';
    size?: 'sm' | 'md';
}

export function Badge({
    className,
    variant = 'default',
    size = 'md',
    children,
    ...props
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

    const variants = {
        default: 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]',
        income: 'bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-500',
        expense: 'bg-danger-50 text-danger-600 dark:bg-danger-500/20 dark:text-danger-500',
        transfer: 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
        outline: 'border border-[rgb(var(--border-primary))] text-[rgb(var(--text-secondary))]',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
            {children}
        </span>
    );
}

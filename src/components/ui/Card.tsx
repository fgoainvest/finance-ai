import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
        const baseStyles = 'rounded-xl transition-all duration-200';

        const variants = {
            default: `
        bg-[rgb(var(--bg-card))]
        shadow-sm
        border border-[rgb(var(--border-secondary))]
      `,
            glass: `
        glass-card
      `,
            bordered: `
        bg-transparent
        border-2 border-[rgb(var(--border-primary))]
      `,
        };

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-4 sm:p-5',
            lg: 'p-6 sm:p-8',
        };

        const hoverStyles = hoverable
            ? 'hover:shadow-md hover:border-[rgb(var(--border-primary))] cursor-pointer hover:-translate-y-0.5'
            : '';

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center justify-between mb-4', className)} {...props} />
    )
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('font-display font-semibold text-lg text-[rgb(var(--text-primary))]', className)}
            {...props}
        />
    )
);

CardTitle.displayName = 'CardTitle';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('', className)} {...props} />
    )
);

CardContent.displayName = 'CardContent';

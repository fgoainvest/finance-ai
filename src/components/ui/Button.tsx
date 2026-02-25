import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-300
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

        const variants = {
            primary: `
        bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))]
        text-white
        shadow-[0_0_15px_rgba(var(--accent-glow),0.5)]
        hover:shadow-[0_0_25px_rgba(var(--accent-glow),0.7)]
        hover:scale-[1.02]
        border-none
      `,
            secondary: `
        bg-[rgba(var(--bg-secondary),0.5)]
        backdrop-blur-sm
        text-[rgb(var(--text-primary))]
        border border-[rgba(var(--border-primary),0.5)]
        hover:bg-[rgba(var(--bg-secondary),0.8)]
        hover:border-[rgb(var(--accent-primary))]
      `,
            ghost: `
        bg-transparent
        text-[rgb(var(--text-secondary))]
        hover:bg-[rgba(var(--bg-secondary),0.5)]
        hover:text-[rgb(var(--text-primary))]
      `,
            danger: `
        bg-gradient-to-r from-red-500 to-rose-600
        text-white
        shadow-[0_0_15px_rgba(239,68,68,0.4)]
        hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]
        hover:scale-[1.02]
      `,
            success: `
        bg-gradient-to-r from-emerald-500 to-teal-500
        text-white
        shadow-[0_0_15px_rgba(16,185,129,0.4)]
        hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]
        hover:scale-[1.02]
      `,
        };

        const sizes = {
            sm: 'h-8 px-3 text-sm rounded-md',
            md: 'h-10 px-4 text-sm rounded-lg',
            lg: 'h-12 px-6 text-base rounded-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

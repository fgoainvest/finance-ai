import { forwardRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            `w-full h-11 px-4 rounded-xl
              bg-[rgba(var(--bg-secondary),0.5)] 
              backdrop-blur-sm
              border border-[rgba(var(--border-primary),0.6)]
              text-[rgb(var(--text-primary))]
              placeholder:text-[rgb(var(--text-muted))]
              focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-[rgba(var(--bg-secondary),0.8)]`,
                            leftIcon && 'pl-11',
                            rightIcon && 'pr-11',
                            error && 'border-expense focus:ring-expense', // mapped expense to danger color reference
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        `w-full h-11 px-4 rounded-xl
            bg-[rgba(var(--bg-secondary),0.5)]
            backdrop-blur-sm
            border border-[rgba(var(--border-primary),0.6)]
            text-[rgb(var(--text-primary))]
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer appearance-none
            hover:bg-[rgba(var(--bg-secondary),0.8)]
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
            bg-[length:20px] bg-[right_12px_center] bg-no-repeat`,
                        error && 'border-expense focus:ring-expense',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    className={cn(
                        `w-full min-h-[80px] px-3 py-2 rounded-lg
            bg-[rgb(var(--bg-secondary))]
            border border-[rgb(var(--border-primary))]
            text-[rgb(var(--text-primary))]
            placeholder:text-[rgb(var(--text-muted))]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none`,
                        error && 'border-danger-500 focus:ring-danger-500',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

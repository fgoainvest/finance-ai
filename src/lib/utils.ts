import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CurrencyCode } from '@/types';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(
    amount: number,
    currency: CurrencyCode = 'BRL',
    locale?: string
): string {
    const locales: Record<CurrencyCode, string> = {
        BRL: 'pt-BR',
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
    };

    return new Intl.NumberFormat(locale || locales[currency], {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date with locale
 */
export function formatDate(
    date: string | Date,
    format: 'short' | 'long' | 'relative' = 'short',
    locale = 'pt-BR'
): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'relative') {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        const diff = d.getTime() - Date.now();
        const days = Math.round(diff / (1000 * 60 * 60 * 24));

        if (Math.abs(days) < 1) {
            const hours = Math.round(diff / (1000 * 60 * 60));
            if (Math.abs(hours) < 1) {
                const minutes = Math.round(diff / (1000 * 60));
                return rtf.format(minutes, 'minute');
            }
            return rtf.format(hours, 'hour');
        }
        if (Math.abs(days) < 30) {
            return rtf.format(days, 'day');
        }
        if (Math.abs(days) < 365) {
            return rtf.format(Math.round(days / 30), 'month');
        }
        return rtf.format(Math.round(days / 365), 'year');
    }

    return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: format === 'long' ? 'long' : '2-digit',
        year: 'numeric',
    });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Currency info
 */
export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string }> = {
    BRL: { symbol: 'R$', name: 'Real Brasileiro' },
    USD: { symbol: '$', name: 'Dólar Americano' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'Libra Esterlina' },
};

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Re-export CurrencyCode for convenience
export type { CurrencyCode } from '@/types';

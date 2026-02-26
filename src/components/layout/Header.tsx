import { Moon, Sun, Bell, Search, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                {/* Left - Title (Mobile shows logo) */}
                <div className="flex items-center gap-3">
                    <div className="md:hidden flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary-500" />
                        <span className="font-display font-bold text-primary-600 dark:text-primary-400">
                            Financeiro
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <h1 className="font-display font-semibold text-xl text-text-primary">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-text-muted">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Right - Actions */}
                <div className="flex items-center gap-2">
                    {/* Search (hidden on mobile) */}
                    <button
                        className={cn(
                            `hidden sm:flex items-center gap-2 h-9 px-3
              bg-bg-secondary
              border border-border-primary
              rounded-lg text-text-muted
              hover:text-text-secondary
              transition-colors cursor-pointer`
                        )}
                    >
                        <Search className="h-4 w-4" />
                        <span className="text-sm">Buscar...</span>
                        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-bg-tertiary rounded">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Notifications */}
                    <button
                        className={cn(
                            `p-2 rounded-lg
              text-text-muted
              hover:text-text-primary
              hover:bg-bg-tertiary
              transition-colors relative`
                        )}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            `p-2 rounded-lg
              text-text-muted
              hover:text-text-primary
              hover:bg-bg-tertiary
              transition-colors`
                        )}
                        aria-label={resolvedTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {resolvedTheme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {/* User Avatar */}
                    <button
                        className={cn(
                            `w-9 h-9 rounded-full
              bg-gradient-to-br from-primary-500 to-primary-700
              flex items-center justify-center
              text-white font-medium text-sm
              shadow-md hover:shadow-lg
              transition-shadow`
                        )}
                    >
                        U
                    </button>
                </div>
            </div>
        </header>
    );
}

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    PiggyBank,
    Settings,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Tag,
    Repeat,
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    href: string;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight, href: '/transactions' },
    { id: 'categories', label: 'Categorias', icon: Tag, href: '/categories' },
    { id: 'accounts', label: 'Contas', icon: PiggyBank, href: '/accounts' },
    { id: 'recurring', label: 'Recorrência', icon: Repeat, href: '/recurring' },
    { id: 'settings', label: 'Configurações', icon: Settings, href: '/settings' },
];

interface SidebarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                `hidden md:flex flex-col
        h-screen fixed left-0 top-0 z-40
        glass border-r-0
        transition-all duration-300`,
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-[rgba(var(--border-secondary),0.5)]">
                {isCollapsed ? (
                    <Sparkles className="h-6 w-6 text-[rgb(var(--accent-primary))] drop-shadow-[0_0_8px_rgba(var(--accent-glow),0.5)]" />
                ) : (
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-[rgb(var(--accent-primary))] drop-shadow-[0_0_8px_rgba(var(--accent-glow),0.5)]" />
                        <span className="font-display font-bold text-lg bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--text-secondary))] bg-clip-text text-transparent">
                            Financeiro
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                text-[rgb(var(--text-secondary))]
                hover:bg-[rgba(var(--accent-primary),0.1)] hover:text-[rgb(var(--text-primary))]`,
                                isActive && `
                  bg-[rgba(var(--accent-primary),0.15)] 
                  text-[rgb(var(--accent-primary))]
                  shadow-[0_0_10px_rgba(var(--accent-glow),0.2)]
                  border border-[rgba(var(--accent-primary),0.2)]
                `,
                                isCollapsed && 'justify-center'
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-2 border-t border-[rgb(var(--border-secondary))]">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        `w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
            text-[rgb(var(--text-muted))]
            hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--text-primary))]
            transition-colors`
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5" />
                            <span className="text-sm">Recolher</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}

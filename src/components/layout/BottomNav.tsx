import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Plus,
    Target,
    Settings,
    Tag,
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    isAction?: boolean;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { id: 'add', label: 'Adicionar', icon: Plus, isAction: true },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'settings', label: 'Config', icon: Settings },
];

interface BottomNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onAddClick: () => void;
}

export function BottomNav({ currentPage, onNavigate, onAddClick }: BottomNavProps) {
    return (
        <nav
            className={cn(
                `fixed bottom-4 left-4 right-4 z-40
        md:hidden
        glass rounded-2xl
        safe-area-bottom`
            )}
        >
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <button
                                key={item.id}
                                onClick={onAddClick}
                                className={cn(
                                    `flex flex-col items-center justify-center
                  w-14 h-14 -mt-8
                  bg-gradient-to-r from-accent-primary to-accent-secondary
                  text-white
                  rounded-full shadow-[0_0_15px_rgba(var(--accent-glow),0.5)]
                  active:scale-95 transition-transform border-4 border-bg-primary`
                                )}
                            >
                                <Icon className="h-6 w-6" />
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                `flex flex-col items-center justify-center gap-0.5
                px-3 py-1 rounded-lg
                transition-colors`,
                                isActive
                                    ? 'text-accent-primary'
                                    : 'text-text-muted'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Plus,
    Target,
    Settings,
    Tag,
    Clock,
    X,
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    isAction?: boolean;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Extrato', icon: ArrowLeftRight },
    { id: 'add', label: 'Lançar', icon: Plus, isAction: true },
    { id: 'accounts', label: 'Contas', icon: Target },
    { id: 'more', label: 'Mais', icon: Settings },
];

interface BottomNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
    onAddClick: () => void;
}

export function BottomNav({ currentPage, onNavigate, onAddClick }: BottomNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavigate = (id: string) => {
        if (id === 'more') {
            setIsMenuOpen(true);
            return;
        }
        onNavigate(id);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* More Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end p-4 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="relative glass p-6 rounded-[2rem] shadow-2xl border border-white/10 animate-in slide-in-from-bottom-8 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-bold text-accent-primary">Mais Opções</h3>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-white/5 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleNavigate('categories')}
                                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                            >
                                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                    <Tag className="h-6 w-6 text-indigo-400" />
                                </div>
                                <span className="text-sm font-semibold">Categorias</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('recurring')}
                                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                            >
                                <div className="p-3 bg-amber-500/20 rounded-2xl">
                                    <Clock className="h-6 w-6 text-amber-400" />
                                </div>
                                <span className="text-sm font-semibold">Recorrências</span>
                            </button>
                            <button
                                onClick={() => handleNavigate('settings')}
                                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                            >
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <Settings className="h-6 w-6 text-emerald-400" />
                                </div>
                                <span className="text-sm font-semibold">Ajustes</span>
                            </button>
                            <div className="p-4 rounded-3xl bg-accent-primary/5 border border-accent-primary/10 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-[10px] text-text-muted">Pro v2.0</p>
                                    <p className="text-xs font-bold text-accent-primary">Financeiro AI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        const isActive = currentPage === item.id || (item.id === 'more' && ['categories', 'settings', 'recurring'].includes(currentPage));
                        const Icon = item.icon;

                        if (item.isAction) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={onAddClick}
                                    className={cn(
                                        `flex flex-col items-center justify-center
                                        w-14 h-14 -mt-8
                                        bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))]
                                        text-white
                                        rounded-full shadow-[0_0_15px_rgba(var(--accent-glow),0.5)]
                                        active:scale-95 transition-transform border-4 border-[rgb(var(--bg-primary))]`
                                    )}
                                >
                                    <Icon className="h-6 w-6" />
                                </button>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className={cn(
                                    `flex flex-col items-center justify-center gap-0.5
                                    px-3 py-1 rounded-lg
                                    transition-colors`,
                                    isActive
                                        ? 'text-[rgb(var(--accent-primary))]'
                                        : 'text-[rgb(var(--text-muted))]'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

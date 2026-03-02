import { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, Search, Sparkles, X, LayoutDashboard, CreditCard, Tag, Settings as SettingsIcon, Calendar, ArrowRight, User as UserIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
    title: string;
    subtitle?: string;
    onNavigate: (page: string) => void;
}

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'Bem-vindo ao Financeiro AI! 🚀',
        message: 'Comece cadastrando suas contas e despesas para ter uma visão completa das suas finanças.',
        time: 'Agora mesmo',
        type: 'info'
    },
    {
        id: '2',
        title: 'Dica de IA 🤖',
        message: 'Você pode enviar fotos de recibos no chat para a IA lançar seus gastos automaticamente!',
        time: '5 min atrás',
        type: 'ai'
    }
];

const SEARCH_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', path: 'transactions', icon: CreditCard },
    { id: 'categories', label: 'Categorias', path: 'categories', icon: Tag },
    { id: 'accounts', label: 'Contas', path: 'accounts', icon: CreditCard },
    { id: 'recurring', label: 'Recorrência', path: 'recurring', icon: Calendar },
    { id: 'settings', label: 'Configurações', path: 'settings', icon: SettingsIcon },
];

export function Header({ title, subtitle, onNavigate }: HeaderProps) {
    const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(2);

    const notificationRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsNotificationsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredSearch = SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchNavigate = (path: string) => {
        onNavigate(path);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    return (
        <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-border-secondary">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                {/* Left - Title */}
                <div className="flex items-center gap-3">
                    <div className="md:hidden flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-accent-primary" />
                        <span className="font-display font-bold text-accent-primary">
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
                    {/* Search */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className={cn(
                            `hidden sm:flex items-center gap-2 h-9 px-3
              bg-bg-secondary
              border border-border-primary/50
              rounded-lg text-text-muted
              hover:text-text-secondary
              hover:border-accent-primary/30
              transition-all cursor-pointer group`
                        )}
                    >
                        <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm">Buscar...</span>
                        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-bg-tertiary rounded opacity-70">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => {
                                setIsNotificationsOpen(!isNotificationsOpen);
                                if (unreadCount > 0) setUnreadCount(0);
                            }}
                            className={cn(
                                `p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all relative`,
                                isNotificationsOpen && "bg-bg-tertiary text-text-primary"
                            )}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 w-2 h-2 bg-expense rounded-full shadow-[0_0_8px_rgba(var(--expense),0.6)]"
                                />
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 glass-card p-2 z-40 overflow-hidden"
                                >
                                    <div className="p-3 border-b border-border-primary/50">
                                        <h4 className="font-bold text-sm">Notificações</h4>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {NOTIFICATIONS.length > 0 ? (
                                            NOTIFICATIONS.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className="p-3 hover:bg-bg-tertiary/50 rounded-xl transition-colors cursor-pointer group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase tracking-widest",
                                                            notif.type === 'ai' ? 'text-accent-primary' : 'text-text-muted'
                                                        )}>
                                                            {notif.type === 'ai' ? 'IA Financeira' : 'Sistema'}
                                                        </span>
                                                        <span className="text-[10px] text-text-muted">{notif.time}</span>
                                                    </div>
                                                    <h5 className="text-sm font-semibold mb-1 group-hover:text-accent-primary transition-colors underline-offset-4 group-hover:underline">{notif.title}</h5>
                                                    <p className="text-xs text-text-muted line-clamp-2">{notif.message}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-text-muted italic flex flex-col items-center gap-2">
                                                <Bell className="h-8 w-8 opacity-20" />
                                                <p className="text-xs">Nenhuma nova notificação</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            `p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all`
                        )}
                        aria-label={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                    >
                        {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Avatar */}
                    <div className="relative group">
                        <button
                            className={cn(
                                `w-9 h-9 rounded-full
                                bg-gradient-to-br from-accent-primary to-accent-secondary
                                flex items-center justify-center
                                text-white font-bold text-sm
                                shadow-[0_0_15px_rgba(var(--accent-primary),0.3)] 
                                hover:shadow-[0_0_20px_rgba(var(--accent-primary),0.5)]
                                transition-all hover:scale-105 active:scale-95`
                            )}
                        >
                            {userInitial}
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:pt-40">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsSearchOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="w-full max-w-xl glass-card relative z-50 overflow-hidden p-0 shadow-2xl"
                        >
                            <div className="p-4 flex items-center gap-3 border-b border-border-primary/50">
                                <Search className="h-5 w-5 text-accent-primary" />
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted"
                                    placeholder="Buscar por páginas, ações ou relatórios..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-1.5 hover:bg-bg-tertiary rounded-lg text-text-muted transition-all"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                                <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                    Navegação Rápida
                                </div>
                                {filteredSearch.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSearchNavigate(item.path)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-bg-tertiary rounded-xl transition-all group"
                                    >
                                        <div className="p-2 bg-bg-secondary rounded-lg group-hover:bg-accent-primary group-hover:text-white transition-all">
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                    </button>
                                ))}

                                {filteredSearch.length === 0 && (
                                    <div className="py-12 text-center text-text-muted animate-pulse">
                                        Nenhum resultado para "{searchQuery}"
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-bg-secondary/50 border-t border-border-primary/50 flex justify-between items-center text-[10px] text-text-muted font-medium">
                                <div className="flex gap-4">
                                    <span><kbd className="bg-bg-tertiary px-1 rounded">ESC</kbd> Fechar</span>
                                    <span><kbd className="bg-bg-tertiary px-1 rounded">↵</kbd> Selecionar</span>
                                </div>
                                <span>Powered by AI ✨</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}

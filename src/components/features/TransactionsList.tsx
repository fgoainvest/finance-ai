import { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Trash2,
    Edit3,
    Clock,
    HelpCircle,
    // Category icons
    UtensilsCrossed,
    Car,
    Home,
    Zap,
    Heart,
    GraduationCap,
    Gamepad2,
    ShoppingBag,
    Plane,
    CreditCard,
    PawPrint,
    Gift,
    MoreHorizontal,
    Banknote,
    Laptop,
    TrendingUp,
    RotateCcw,
    Plus,
    Wallet
} from 'lucide-react';
import { Card, Badge, Button, ConfirmDialog } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction, TransactionType } from '@/types';

// Icon map for dynamic category icon rendering
const ICON_MAP: Record<string, React.ElementType> = {
    UtensilsCrossed,
    Car,
    Home,
    Zap,
    Heart,
    GraduationCap,
    Gamepad2,
    ShoppingBag,
    Plane,
    CreditCard,
    PawPrint,
    Gift,
    MoreHorizontal,
    Banknote,
    Laptop,
    TrendingUp,
    RotateCcw,
    Plus,
    Wallet,
    HelpCircle
};

interface TransactionsListProps {
    onEdit: (transaction: Transaction) => void;
    onAdd: () => void;
}

export function TransactionsList({ onEdit, onAdd }: TransactionsListProps) {
    const { state, dispatch, getCategoryById, getAccountById } = useApp();
    const { showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return state.transactions.filter((t: Transaction) => {
            const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            const matchesCategory = filterCategory === 'all' || t.categoryId === filterCategory;
            return matchesSearch && matchesType && matchesCategory;
        });
    }, [state.transactions, searchQuery, filterType, filterCategory]);

    // Group by date
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        filteredTransactions.forEach((t) => {
            const dateKey = t.date.split('T')[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(t);
        });

        return Object.entries(groups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, transactions]) => ({ date, transactions }));
    }, [filteredTransactions]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: deleteId });
            showToast('Transação excluída com sucesso', 'success');
            setDeleteId(null);
        }
    };

    const getIcon = (iconName: string) => {
        return ICON_MAP[iconName] || HelpCircle;
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <Card variant="glass" padding="sm" className="border-[rgba(var(--border-primary),0.3)]">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))] group-focus-within:text-[rgb(var(--accent-primary))] transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar transações..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[rgba(var(--bg-secondary),0.5)] border border-[rgba(var(--border-primary),0.3)] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent transition-all backdrop-blur-md"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        leftIcon={<Filter className="h-4 w-4" />}
                        className="rounded-xl h-11 border-[rgba(var(--border-primary),0.3)] bg-[rgba(var(--bg-secondary),0.5)]"
                    >
                        Filtros
                    </Button>

                    {/* Add Button (Desktop) */}
                    <Button
                        variant="primary"
                        onClick={onAdd}
                        className="hidden sm:flex rounded-xl h-11 px-6 shadow-[0_0_15px_rgba(var(--accent-glow),0.3)]"
                    >
                        Nova Transação
                    </Button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-[rgba(var(--border-secondary),0.2)] flex flex-wrap gap-4 animate-in slide-in-from-top-2 duration-300">
                        {/* Type Filter */}
                        <div className="flex gap-2 p-1 bg-[rgba(var(--bg-secondary),0.4)] rounded-xl border border-[rgba(var(--border-primary),0.2)]">
                            {(['all', 'income', 'expense', 'transfer'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                                        filterType === t
                                            ? 'bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white shadow-lg'
                                            : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]'
                                    )}
                                >
                                    {t === 'all' ? 'Todas' : t === 'income' ? 'Receitas' : t === 'expense' ? 'Despesas' : 'Transf.'}
                                </button>
                            ))}
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="h-10 px-4 pr-10 rounded-xl bg-[rgba(var(--bg-secondary),0.4)] border border-[rgba(var(--border-primary),0.2)] text-xs font-bold uppercase tracking-wider text-[rgb(var(--text-primary))] appearance-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                            >
                                <option value="all">Todas Categorias</option>
                                {state.categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--text-muted))] pointer-events-none" />
                        </div>
                    </div>
                )}
            </Card>

            {/* Transactions List */}
            {groupedTransactions.length === 0 ? (
                <Card className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-[rgb(var(--text-muted))] mb-3" />
                    <p className="text-[rgb(var(--text-secondary))]">
                        {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                            ? 'Nenhuma transação encontrada'
                            : 'Nenhuma transação ainda'}
                    </p>
                    {!searchQuery && filterType === 'all' && filterCategory === 'all' && (
                        <Button variant="ghost" onClick={onAdd} className="mt-3">
                            Adicionar primeira transação
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {groupedTransactions.map(({ date, transactions }) => (
                        <div key={date}>
                            {/* Date Header */}
                            <h3 className="text-sm font-medium text-[rgb(var(--text-muted))] mb-2 px-1">
                                {formatDate(date, 'long')}
                            </h3>

                            {/* Transactions */}
                            <Card padding="none" className="divide-y divide-[rgb(var(--border-secondary))]">
                                {transactions.map((transaction: Transaction) => {
                                    const category = getCategoryById(transaction.categoryId);
                                    const account = getAccountById(transaction.accountId);
                                    const IconComponent = category ? getIcon(category.icon) : HelpCircle;

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center gap-3 p-4 hover:bg-[rgb(var(--bg-card-hover))] transition-colors"
                                        >
                                            {/* Category Icon */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: (category?.color || '#94A3B8') + '20' }}
                                            >
                                                <IconComponent
                                                    className="h-5 w-5"
                                                    style={{ color: category?.color || '#94A3B8' }}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-[rgb(var(--text-primary))] truncate">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-[rgb(var(--text-muted))]">
                                                        {category?.name}
                                                    </span>
                                                    <span className="text-xs text-[rgb(var(--text-muted))]">•</span>
                                                    <span className="text-xs text-[rgb(var(--text-muted))]">
                                                        {account?.name}
                                                    </span>
                                                    {transaction.isRecurring && (
                                                        <Badge variant="outline" size="sm">
                                                            Recorrente
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right shrink-0">
                                                <p
                                                    className={cn(
                                                        'font-semibold',
                                                        transaction.type === 'income'
                                                            ? 'text-[rgb(var(--income))]'
                                                            : transaction.type === 'expense'
                                                                ? 'text-[rgb(var(--expense))]'
                                                                : 'text-[rgb(var(--transfer))]'
                                                    )}
                                                >
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount, transaction.currency)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => onEdit(transaction)}
                                                    className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(transaction.id)}
                                                    className="p-2 rounded-lg text-[rgb(var(--text-muted))] hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/20 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Card>
                        </div>
                    ))}
                </div>
            )}
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Transação"
                message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita e o saldo das contas será recalculado."
                confirmLabel="Excluir"
                variant="danger"
            />
        </div>
    );
}

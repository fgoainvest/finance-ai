import { useState } from 'react';
import { Plus, Wallet, Pencil, Trash2, CreditCard, Banknote, Building2, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Account, AccountType, CurrencyCode } from '@/types';

// Helper to get icon based on account type
const getAccountIcon = (type: AccountType) => {
    switch (type) {
        case 'bank': return Building2;
        case 'cash': return Banknote;
        case 'credit': return CreditCard;
        case 'investment': return TrendingUp;
        default: return Wallet;
    }
};

const accountTypes: { value: AccountType; label: string }[] = [
    { value: 'bank', label: 'Conta Corrente' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'investment', label: 'Investimento' },
];

const currencies: CurrencyCode[] = ['BRL', 'USD', 'EUR', 'GBP'];

const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
];

export function Accounts() {
    const { state, dispatch } = useApp();
    const { showToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Account>>({
        name: '',
        type: 'bank',
        balance: 0,
        currency: 'BRL',
        color: colors[0],
        icon: 'wallet', // Default icon string, though we use typed icons in UI
    });

    const handleOpenModal = (account?: Account) => {
        if (account) {
            setEditingAccount(account);
            setFormData(account);
        } else {
            setEditingAccount(null);
            setFormData({
                name: '',
                type: 'bank',
                balance: 0,
                currency: 'BRL',
                color: colors[0],
                icon: 'wallet',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) return;

        if (editingAccount) {
            dispatch({
                type: 'UPDATE_ACCOUNT',
                payload: {
                    id: editingAccount.id,
                    updates: formData,
                },
            });
            showToast('Conta atualizada com sucesso', 'success');
        } else {
            dispatch({
                type: 'ADD_ACCOUNT',
                payload: formData as Omit<Account, 'id'>,
            });
            showToast('Conta criada com sucesso', 'success');
        }

        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch({ type: 'DELETE_ACCOUNT', payload: deleteId });
            showToast('Conta excluída com sucesso', 'success');
            setDeleteId(null);
        }
    };

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-[rgb(var(--text-primary))]">
                    Minhas Contas
                </h2>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Conta
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.accounts.map((account) => {
                    const Icon = getAccountIcon(account.type);

                    return (
                        <Card
                            key={account.id}
                            variant="glass"
                            className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border-[rgba(var(--border-primary),0.3)] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]"
                        >
                            <div
                                className="absolute top-0 left-0 w-1.5 h-full transition-all group-hover:w-2.5 opacity-80"
                                style={{ backgroundColor: account.color, boxShadow: `0 0 15px ${account.color}60` }}
                            />

                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div
                                        className="p-3.5 rounded-2xl border backdrop-blur-md transition-transform group-hover:scale-110 duration-500"
                                        style={{
                                            backgroundColor: `${account.color}15`,
                                            color: account.color,
                                            borderColor: `${account.color}30`,
                                            boxShadow: `inset 0 0 10px ${account.color}10`
                                        }}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-white/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenModal(account);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(account.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[rgb(var(--text-muted))] mb-1.5">
                                        {account.name}
                                    </h3>
                                    <p className="text-2xl font-bold font-display text-[rgb(var(--text-primary))] tracking-tight">
                                        {formatCurrency(account.balance, account.currency)}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-[rgba(var(--border-secondary),0.2)] flex justify-between text-[10px] uppercase font-bold tracking-wider text-[rgb(var(--text-muted))]">
                                    <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{accountTypes.find(t => t.value === account.type)?.label}</span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{account.currency}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingAccount ? 'Editar Conta' : 'Nova Conta'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                            Nome da Conta
                        </label>
                        <Input
                            placeholder="Ex: Nubank, Carteira..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                Tipo
                            </label>
                            <select
                                className="w-full h-10 px-3 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
                            >
                                {accountTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                Moeda
                            </label>
                            <select
                                className="w-full h-10 px-3 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value as CurrencyCode })}
                            >
                                {currencies.map(curr => (
                                    <option key={curr} value={curr}>
                                        {curr}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                            Saldo Inicial
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.balance}
                            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                            Cor
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                                        formData.color === color ? "ring-2 ring-[rgb(var(--text-primary))]" : ""
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingAccount ? 'Salvar Alterações' : 'Criar Conta'}
                        </Button>
                    </div>
                </form>
            </Modal>
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Conta"
                message="Tem certeza que deseja excluir esta conta? Todas as transações associadas serão perdidas e esta ação não pode ser desfeita."
                confirmLabel="Excluir"
                variant="danger"
            />
        </div>
    );
}

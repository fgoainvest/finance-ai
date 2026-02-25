import { useState, useEffect } from 'react';
import { Button, Input, Select, Textarea, Modal } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import type { TransactionType, RecurringFrequency } from '@/types';
import { CURRENCIES } from '@/lib/utils';
import type { CurrencyCode } from '@/lib/utils';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiService } from '@/services/ai';

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    editTransaction?: {
        id: string;
        type: TransactionType;
        amount: number;
        currency: CurrencyCode;
        description: string;
        categoryId: string;
        accountId: string;
        date: string;
        notes?: string;
        isRecurring: boolean;
    };
}

export function TransactionForm({ isOpen, onClose, editTransaction }: TransactionFormProps) {
    const { state, dispatch } = useApp();
    const { showToast } = useToast();

    const [type, setType] = useState<TransactionType>(editTransaction?.type || 'expense');
    const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
    const [currency, setCurrency] = useState<CurrencyCode>(editTransaction?.currency || state.settings.defaultCurrency);
    const [description, setDescription] = useState(editTransaction?.description || '');
    const [categoryId, setCategoryId] = useState(editTransaction?.categoryId || '');
    const [accountId, setAccountId] = useState(editTransaction?.accountId || state.accounts[0]?.id || '');
    const [date, setDate] = useState(editTransaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState(editTransaction?.notes || '');
    const [isRecurring, setIsRecurring] = useState(editTransaction?.isRecurring || false);
    const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    // Sync form state with editTransaction prop when it changes
    useEffect(() => {
        if (isOpen) {
            setType(editTransaction?.type || 'expense');
            setAmount(editTransaction?.amount?.toString() || '');
            setCurrency(editTransaction?.currency || state.settings.defaultCurrency);
            setDescription(editTransaction?.description || '');
            setCategoryId(editTransaction?.categoryId || '');
            setAccountId(editTransaction?.accountId || state.accounts[0]?.id || '');
            setDate(editTransaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
            setNotes(editTransaction?.notes || '');
            setIsRecurring(editTransaction?.isRecurring || false);
            setAiSuggestion(null);
        }
    }, [editTransaction, isOpen, state.settings.defaultCurrency, state.accounts]);

    const categories = state.categories.filter(c => c.type === type || type === 'transfer');

    const currencyOptions = Object.entries(CURRENCIES).map(([code, info]) => ({
        value: code,
        label: `${info.symbol} ${info.name}`,
    }));

    const accountOptions = state.accounts.map(acc => ({
        value: acc.id,
        label: acc.name,
    }));

    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.name,
    }));

    const handleDescriptionBlur = async () => {
        if (!description || description.length < 3) return;

        setIsLoadingAI(true);
        setAiSuggestion(null);

        try {
            const categoryNames = state.categories
                .filter(c => c.type === type || type === 'transfer')
                .map(c => c.name);

            const result = await aiService.classifyTransaction(description, categoryNames);

            if (result && result.categoryName) {
                const match = state.categories.find(c =>
                    c.name.toLowerCase() === result.categoryName.toLowerCase() &&
                    (c.type === type || type === 'transfer')
                );

                if (match) {
                    setAiSuggestion(match.name);
                    if (!categoryId) {
                        setCategoryId(match.id);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingAI(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !description || !categoryId || !accountId) return;

        const transactionData = {
            type,
            amount: parseFloat(amount),
            currency,
            description,
            categoryId,
            accountId,
            date: new Date(date).toISOString(),
            notes: notes || undefined,
            isRecurring,
            aiCategorySuggestion: aiSuggestion || undefined,
        };

        if (editTransaction?.id) {
            dispatch({
                type: 'UPDATE_TRANSACTION',
                payload: { id: editTransaction.id, updates: transactionData },
            });
            showToast('Transação atualizada com sucesso', 'success');
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload: transactionData });
            showToast('Transação criada com sucesso', 'success');

            if (isRecurring) {
                const nextDate = new Date(date);
                switch (frequency) {
                    case 'daily': nextDate.setDate(nextDate.getDate() + 1); break;
                    case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
                    case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
                    case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
                }

                dispatch({
                    type: 'ADD_RECURRING_RULE',
                    payload: {
                        frequency,
                        startDate: new Date(date).toISOString(),
                        nextDate: nextDate.toISOString(),
                        amount: parseFloat(amount),
                        description,
                        categoryId,
                        accountId,
                        type,
                        active: true,
                    }
                });
            }
        }

        onClose();
        resetForm();
    };

    const resetForm = () => {
        setType('expense');
        setAmount('');
        setDescription('');
        setCategoryId('');
        setNotes('');
        setIsRecurring(false);
        setFrequency('monthly');
        setAiSuggestion(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editTransaction ? 'Editar Transação' : 'Nova Transação'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Selector */}
                <div className="flex gap-2 p-1.5 bg-[rgba(var(--bg-secondary),0.5)] backdrop-blur-md rounded-2xl border border-[rgba(var(--border-primary),0.3)] shadow-inner">
                    {(['income', 'expense', 'transfer'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={cn(
                                'flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300',
                                type === t
                                    ? t === 'income'
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border-none'
                                        : t === 'expense'
                                            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] border-none'
                                            : 'bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white shadow-[0_0_15px_rgba(var(--accent-glow),0.4)] border-none'
                                    : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-white/5'
                            )}
                        >
                            {t === 'income' ? 'Receita' : t === 'expense' ? 'Despesa' : 'Transf.'}
                        </button>
                    ))}
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <Input
                            label="Valor"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <Select
                        label="Moeda"
                        options={currencyOptions}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    />
                </div>

                {/* Description with AI */}
                <div className="relative">
                    <Input
                        label="Descrição"
                        placeholder="Ex: Almoço no restaurante"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        rightIcon={
                            isLoadingAI ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                            ) : (
                                <Sparkles className="h-4 w-4 text-primary-500" />
                            )
                        }
                        required
                    />
                    {aiSuggestion && (
                        <p className="mt-1 text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            IA sugeriu a categoria automaticamente
                        </p>
                    )}
                </div>

                {/* Category and Account */}
                <div className="grid grid-cols-2 gap-3">
                    <Select
                        label="Categoria"
                        options={[{ value: '', label: 'Selecione...' }, ...categoryOptions]}
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    />
                    <Select
                        label="Conta"
                        options={accountOptions}
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        required
                    />
                </div>

                {/* Date */}
                <Input
                    label="Data"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                {/* Recurring Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 rounded border-[rgb(var(--border-primary))] text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-[rgb(var(--text-secondary))]">
                        Transação recorrente
                    </span>
                </label>

                {isRecurring && (
                    <div className="pl-7 animate-in slide-in-from-top-2 fade-in duration-200">
                        <Select
                            label="Frequência"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                            options={[
                                { value: 'daily', label: 'Diariamente' },
                                { value: 'weekly', label: 'Semanalmente' },
                                { value: 'monthly', label: 'Mensalmente' },
                                { value: 'yearly', label: 'Anualmente' },
                            ]}
                        />
                    </div>
                )}

                {/* Notes */}
                <Textarea
                    label="Notas (opcional)"
                    placeholder="Adicione observações..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant={type === 'income' ? 'success' : type === 'expense' ? 'danger' : 'primary'}
                        className="flex-1"
                    >
                        {editTransaction ? 'Salvar' : 'Adicionar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

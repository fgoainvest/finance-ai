import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Trash2, Calendar, Repeat, ArrowRight, Wallet } from 'lucide-react';

const FREQUENCY_LABELS: Record<string, string> = {
    daily: 'Diária',
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
};

export function RecurringRules() {
    const { state, dispatch, getAccountById, getCategoryById } = useApp();

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja cancelar essa recorrência?')) {
            dispatch({ type: 'DELETE_RECURRING_RULE', payload: id });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.recurringRules.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-[rgb(var(--text-muted))]">
                        <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma conta fixa ou assinatura cadastrada.</p>
                        <p className="text-sm mt-2">Crie uma nova transação e marque a opção "Recorrente".</p>
                    </div>
                ) : (
                    state.recurringRules.map((rule) => {
                        const account = getAccountById(rule.accountId);
                        const category = getCategoryById(rule.categoryId);

                        return (
                            <Card
                                key={rule.id}
                                variant="glass"
                                className="relative group overflow-hidden transition-all duration-300 hover:scale-[1.02] border-[rgba(var(--border-primary),0.3)] shadow-xl"
                            >
                                <div
                                    className="absolute top-0 left-0 w-1.5 h-full opacity-80"
                                    style={{ backgroundColor: category?.color, boxShadow: `0 0 15px ${category?.color}60` }}
                                />
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-lg text-[rgb(var(--text-primary))] tracking-tight mb-1">{rule.description}</h3>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">
                                                <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center border border-white/5">
                                                    <Wallet className="h-3 w-3" />
                                                </div>
                                                {account?.name}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn(
                                                "font-display font-bold text-xl drop-shadow-sm",
                                                rule.type === 'income' ? 'text-[rgb(var(--income))]' : 'text-[rgb(var(--expense))]'
                                            )}>
                                                {rule.type === 'income' ? '+' : '-'}
                                                {formatCurrency(rule.amount, account?.currency)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-[rgba(var(--border-secondary),0.2)]">
                                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col gap-1 items-center justify-center" title="Frequência">
                                            <Repeat className="h-4 w-4 text-[rgb(var(--accent-primary))]" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">{FREQUENCY_LABELS[rule.frequency]}</span>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col gap-1 items-center justify-center" title="Próximo Vencimento">
                                            <Calendar className="h-4 w-4 text-[rgb(var(--accent-secondary))]" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">{formatDate(rule.nextDate)}</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                            onClick={() => handleDelete(rule.id)}
                                            title="Cancelar Recorrência"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

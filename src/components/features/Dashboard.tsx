import { useMemo, useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    PieChart as PieChartIcon,
    Sparkles,
    Loader2,
    RefreshCw,
    ChevronRight,
    Target,
    Zap
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { aiService } from '@/services/ai';

interface DashboardProps {
    onViewTransactions: () => void;
    onAddTransaction: () => void;
}

export function Dashboard({ onViewTransactions, onAddTransaction }: DashboardProps) {
    const {
        state,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        prevMonthlyIncome,
        prevMonthlyExpenses,
        getCategoryById
    } = useApp();

    const [hasMounted, setHasMounted] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const fetchAnalysis = async (force = false) => {
        if (!state.transactions.length) return;

        // Use cached analysis if available and not forcing
        const cached = localStorage.getItem('dashboard_analysis');
        if (cached && !force) {
            setAnalysis(cached);
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await aiService.getFinancialAnalysis(state);
            setAnalysis(result);
            localStorage.setItem('dashboard_analysis', result);
            localStorage.setItem('dashboard_analysis_date', new Date().toISOString());
        } catch (error) {
            console.error('Failed to fetch analysis:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (hasMounted) {
            fetchAnalysis();
        }
    }, [hasMounted]);

    const handleRefreshAnalysis = () => fetchAnalysis(true);

    const calculateVariation = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const incomeVariation = calculateVariation(monthlyIncome, prevMonthlyIncome);
    const expenseVariation = calculateVariation(monthlyExpenses, prevMonthlyExpenses);

    // Calculate monthly data for chart
    const monthlyData = useMemo(() => {
        const last6Months: { month: string; income: number; expense: number }[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = date.toISOString();
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

            const monthTransactions = state.transactions.filter(
                (t) => t.date >= monthStart && t.date <= monthEnd
            );

            last6Months.push({
                month: date.toLocaleDateString('pt-BR', { month: 'short' }),
                income: monthTransactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0),
                expense: monthTransactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0),
            });
        }

        return last6Months;
    }, [state.transactions]);

    // Category breakdown for pie chart
    const categoryData = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        const expenses = state.transactions.filter(
            (t) => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd
        );

        const byCategory = expenses.reduce((acc, t) => {
            const cat = getCategoryById(t.categoryId);
            const name = cat?.name || 'Outros';
            const color = cat?.color || '#94A3B8';
            acc[t.categoryId] = {
                name,
                value: (acc[t.categoryId]?.value || 0) + t.amount,
                color,
            };
            return acc;
        }, {} as Record<string, { name: string; value: number; color: string }>);

        return Object.values(byCategory)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [state.transactions, getCategoryById]);

    // Recent transactions
    const recentTransactions = state.transactions.slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Balance Card */}
                <Card variant="glass" className="bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white border-0 shadow-[0_0_30px_rgba(var(--accent-glow),0.2)] group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
                    <CardContent className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Saldo Total</p>
                                <p className="text-3xl font-display font-bold mt-1 drop-shadow-md">
                                    {formatCurrency(totalBalance)}
                                </p>
                            </div>
                            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                            {state.accounts.slice(0, 2).map((acc) => (
                                <div key={acc.id} className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                                    <span className="text-white/60">{acc.name}:</span>{' '}
                                    <span className="font-bold">{formatCurrency(acc.balance, acc.currency)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Income Card */}
                <Card variant="glass" className="group">
                    <CardContent>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[rgb(var(--text-muted))] text-xs font-bold uppercase tracking-widest">Receitas</p>
                                <p className="text-2xl font-display font-bold mt-1 text-[rgb(var(--income))] drop-shadow-[0_0_10px_rgba(var(--income),0.3)]">
                                    {formatCurrency(monthlyIncome)}
                                </p>
                            </div>
                            <div className="p-3 bg-[rgba(var(--income),0.1)] rounded-2xl border border-[rgba(var(--income),0.25)] group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5 text-[rgb(var(--income))]" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs">
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full font-bold",
                                incomeVariation >= 0
                                    ? "bg-[rgba(var(--income),0.1)] text-[rgb(var(--income))]"
                                    : "bg-[rgba(var(--expense),0.1)] text-[rgb(var(--expense))]"
                            )}>
                                {incomeVariation >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                <span>{Math.abs(Math.round(incomeVariation))}%</span>
                            </div>
                            <span className="text-[rgb(var(--text-muted))]">vs mês passado</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Card */}
                <Card variant="glass" className="group">
                    <CardContent>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[rgb(var(--text-muted))] text-xs font-bold uppercase tracking-widest">Despesas</p>
                                <p className="text-2xl font-display font-bold mt-1 text-[rgb(var(--expense))] drop-shadow-[0_0_10px_rgba(var(--expense),0.3)]">
                                    {formatCurrency(monthlyExpenses)}
                                </p>
                            </div>
                            <div className="p-3 bg-[rgba(var(--expense),0.1)] rounded-2xl border border-[rgba(var(--expense),0.25)] group-hover:scale-110 transition-transform">
                                <TrendingDown className="h-5 w-5 text-[rgb(var(--expense))]" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs">
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full font-bold",
                                expenseVariation <= 0
                                    ? "bg-[rgba(var(--income),0.1)] text-[rgb(var(--income))]"
                                    : "bg-[rgba(var(--expense),0.1)] text-[rgb(var(--expense))]"
                            )}>
                                {expenseVariation >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                <span>{Math.abs(Math.round(expenseVariation))}%</span>
                            </div>
                            <span className="text-[rgb(var(--text-muted))]">vs mês passado</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Net Balance Card */}
                {(() => {
                    const net = monthlyIncome - monthlyExpenses;
                    const isPositive = net >= 0;
                    const savingsRate = monthlyIncome > 0 ? ((net / monthlyIncome) * 100) : 0;
                    return (
                        <Card variant="glass" className="group">
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[rgb(var(--text-muted))] text-xs font-bold uppercase tracking-widest">Balanço do Mês</p>
                                        <p className={cn(
                                            'text-2xl font-display font-bold mt-1 drop-shadow-[0_0_10px_rgba(var(--income),0.3)]',
                                            isPositive ? 'text-[rgb(var(--income))]' : 'text-[rgb(var(--expense))]'
                                        )}>
                                            {isPositive ? '+' : ''}{formatCurrency(net)}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        'p-3 rounded-2xl border group-hover:scale-110 transition-transform',
                                        isPositive
                                            ? 'bg-[rgba(var(--income),0.1)] border-[rgba(var(--income),0.25)]'
                                            : 'bg-[rgba(var(--expense),0.1)] border-[rgba(var(--expense),0.25)]'
                                    )}>
                                        {isPositive ? <TrendingUp className="h-5 w-5 text-[rgb(var(--income))]" /> : <TrendingDown className="h-5 w-5 text-[rgb(var(--expense))]" />}
                                    </div>
                                </div>
                                {monthlyIncome > 0 && (
                                    <div className="mt-4 text-xs text-[rgb(var(--text-muted))]">
                                        <span className={cn('font-bold', isPositive ? 'text-[rgb(var(--income))]' : 'text-[rgb(var(--expense))]')}>
                                            {savingsRate.toFixed(0)}%
                                        </span>
                                        {' '}da receita {isPositive ? 'economizada' : 'no negativo'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })()}
            </div>

            {/* AI Insights Section */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-[2rem] opacity-20 blur group-hover:opacity-30 transition duration-1000"></div>
                <Card variant="glass" className="relative border-[rgba(var(--border-primary),0.3)] shadow-2xl overflow-hidden min-h-[180px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[rgba(var(--accent-primary),0.1)] rounded-xl relative overflow-hidden group/star">
                                <Sparkles className="h-5 w-5 text-[rgb(var(--accent-primary))] relative z-10 group-hover/star:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-[rgba(var(--accent-primary),0.2)] animate-pulse" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Insights da IA
                                    <Badge variant="outline" className="bg-[rgba(var(--accent-primary),0.1)] text-[rgb(var(--accent-primary))] border-[rgba(var(--accent-primary),0.2)]">βeta</Badge>
                                </CardTitle>
                                <p className="text-xs text-[rgb(var(--text-muted))]">Análise de saúde financeira em tempo real</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefreshAnalysis}
                            disabled={isAnalyzing}
                            className="rounded-xl h-9 hover:bg-[rgba(var(--accent-primary),0.1)] hover:text-[rgb(var(--accent-primary))] transition-all"
                        >
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Recalcular</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {isAnalyzing ? (
                            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="relative h-12 w-12">
                                    <div className="absolute inset-0 bg-[rgba(var(--accent-primary),0.2)] rounded-full animate-ping" />
                                    <div className="relative h-12 w-12 flex items-center justify-center bg-[rgba(var(--accent-primary),0.1)] rounded-full border border-[rgba(var(--accent-primary),0.3)]">
                                        <Sparkles className="h-6 w-6 text-[rgb(var(--accent-primary))] animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-[rgb(var(--accent-primary))]">Processando inteligência financeira...</p>
                            </div>
                        ) : !analysis ? (
                            <div className="py-6 text-center border border-dashed border-[rgba(var(--border-primary),0.3)] rounded-2xl">
                                <Zap className="h-6 w-6 mx-auto text-[rgb(var(--text-muted))] mb-2 opacity-50" />
                                <p className="text-xs text-[rgb(var(--text-muted))] mb-3">Clique em recalcular para gerar seus insights.</p>
                                <Button variant="secondary" size="sm" onClick={handleRefreshAnalysis} className="rounded-xl text-xs h-8">
                                    Gerar Análise
                                </Button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ ...props }) => <h1 className="text-lg font-bold text-[rgb(var(--accent-primary))] mb-2" {...props} />,
                                            h2: ({ ...props }) => <h2 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1 mt-3 border-b border-[rgba(var(--border-secondary),0.3)] pb-1" {...props} />,
                                            p: ({ ...props }) => <p className="mb-2 text-xs text-[rgb(var(--text-secondary))] leading-relaxed" {...props} />,
                                            ul: ({ ...props }) => <ul className="ml-4 space-y-1 my-2 list-disc font-medium text-[11px] text-[rgb(var(--text-secondary))]" {...props} />,
                                            li: ({ ...props }) => <li className="mb-0.5" {...props} />,
                                            strong: ({ ...props }) => <strong className="font-bold text-[rgb(var(--text-primary))]" {...props} />,
                                            table: ({ ...props }) => <div className="overflow-x-auto my-3"><table className="w-full text-[10px]" {...props} /></div>,
                                            th: ({ ...props }) => <th className="bg-[rgba(var(--bg-secondary),0.5)] p-1.5 text-left font-bold" {...props} />,
                                            td: ({ ...props }) => <td className="p-1.5 border-b border-[rgba(var(--border-secondary),0.2)]" {...props} />,
                                        }}
                                    >
                                        {analysis}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart - Income vs Expenses */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Receitas vs Despesas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-64 w-full">
                            {hasMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="rgb(var(--income))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="rgb(var(--income))" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="rgb(var(--expense))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="rgb(var(--expense))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(var(--text-secondary), 0.9)', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(var(--text-secondary), 0.9)', fontSize: 10, fontWeight: 700 }}
                                            tickFormatter={(value) => value === 0 ? 'R$0' : value >= 1000 ? `R$${(value / 1000).toFixed(0)}k` : `R$${value}`}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(var(--bg-card), 0.8)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(var(--border-primary), 0.2)',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                            }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            formatter={(value: any) => formatCurrency(value)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            stroke="rgb(var(--income))"
                                            strokeWidth={3}
                                            fill="url(#incomeGradient)"
                                            name="Receitas"
                                            animationDuration={1500}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expense"
                                            stroke="rgb(var(--expense))"
                                            strokeWidth={3}
                                            fill="url(#expenseGradient)"
                                            name="Despesas"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart - Categories */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-48 w-full">
                            {categoryData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <PieChartIcon className="h-10 w-10 text-[rgb(var(--text-muted))] opacity-40 mb-2" />
                                    <p className="text-sm text-[rgb(var(--text-muted))]">Sem dados de despesas</p>
                                    <p className="text-xs text-[rgb(var(--text-muted))] opacity-60 mt-1">Adicione transações para visualizar</p>
                                </div>
                            ) : hasMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgb(var(--bg-card))',
                                                border: '1px solid rgb(var(--border-primary))',
                                                borderRadius: '8px',
                                            } as any}
                                            formatter={(value: any) => formatCurrency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="mt-4 space-y-2">
                            {categoryData.map((cat) => (
                                <div key={cat.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="text-[rgb(var(--text-secondary))]">{cat.name}</span>
                                    </div>
                                    <span className="font-medium text-[rgb(var(--text-primary))]">
                                        {formatCurrency(cat.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                    <button
                        onClick={onViewTransactions}
                        className="text-sm text-accent-primary hover:underline"
                    >
                        Ver todas
                    </button>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="h-12 w-12 mx-auto text-[rgb(var(--text-muted))] mb-3" />
                            <p className="text-[rgb(var(--text-secondary))]">Nenhuma transação ainda</p>
                            <button
                                onClick={onAddTransaction}
                                className="mt-3 text-accent-primary hover:underline text-sm"
                            >
                                Adicionar primeira transação
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentTransactions.map((transaction) => {
                                const category = getCategoryById(transaction.categoryId);
                                return (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between py-2 border-b border-[rgb(var(--border-secondary))] last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: category?.color + '20' }}
                                            >
                                                <span className="text-lg">{category?.icon.charAt(0) || '?'}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[rgb(var(--text-primary))]">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-sm text-[rgb(var(--text-muted))]">
                                                    {category?.name} • {formatDate(transaction.date, 'relative')}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                'font-semibold',
                                                transaction.type === 'income'
                                                    ? 'text-[rgb(var(--income))]'
                                                    : 'text-[rgb(var(--expense))]'
                                            )}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount, transaction.currency)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

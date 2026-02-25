import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Bot, User, Trash2, AlertTriangle, CheckCircle2, Image as ImageIcon, Camera } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { aiService } from '@/services/ai';
import type { AIToolAction, AIChatResult } from '@/services/ai';
import { cn } from '@/lib/utils';

const QUICK_SUGGESTIONS = [
    'Qual é meu saldo total?',
    'Onde mais gastei este mês?',
    'Analise meus gastos',
    'Dê dicas de economia',
    'Lançar despesa de R$50 no mercado',
];

function renderMarkdown(text: string) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-4 space-y-1 my-1">$1</ul>')
        .replace(/\n/g, '<br/>');
}

interface OpenRouterHistoryMessage {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChatDrawer() {
    const { state, dispatch } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<OpenRouterHistoryMessage[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const messages = state.chatHistory || [];

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [messages, isOpen]);

    // Resolve category name to ID
    const resolveCategoryId = (name: string, type: string): string => {
        const categories = state.categories.filter(c => c.type === type);
        const exact = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (exact) return exact.id;
        const partial = categories.find(c =>
            c.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(c.name.toLowerCase())
        );
        if (partial) return partial.id;
        const fallback = categories.find(c => c.name === 'Outros');
        return fallback?.id || categories[0]?.id || '';
    };

    // Resolve account name to ID
    const resolveAccountId = (name: string): string => {
        const accounts = state.accounts;
        const exact = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());
        if (exact) return exact.id;
        const partial = accounts.find(a =>
            a.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(a.name.toLowerCase())
        );
        if (partial) return partial.id;
        return accounts[0]?.id || '';
    };

    // Execute a single transaction tool action
    const executeAddTransaction = (args: Record<string, unknown>): string => {
        const description = args.description as string;
        const amount = args.amount as number;
        const type = args.type as 'income' | 'expense';
        const categoryName = args.category_name as string;
        const accountName = args.account_name as string;
        const date = args.date as string;
        const notes = args.notes as string | undefined;

        const categoryId = resolveCategoryId(categoryName, type);
        const accountId = resolveAccountId(accountName);

        const resolvedCategory = state.categories.find(c => c.id === categoryId);
        const resolvedAccount = state.accounts.find(a => a.id === accountId);

        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                accountId,
                type,
                amount,
                currency: 'BRL',
                description,
                categoryId,
                date: new Date(date + 'T12:00:00').toISOString(),
                notes,
                isRecurring: false,
            }
        });

        return JSON.stringify({
            success: true,
            description,
            amount,
            type,
            category: resolvedCategory?.name || categoryName,
            account: resolvedAccount?.name || accountName,
            date,
        });
    };

    // Execute create account tool action
    const executeCreateAccount = (args: Record<string, unknown>): string => {
        const name = args.name as string;
        const type = args.type as 'bank' | 'cash' | 'credit' | 'investment';
        const balance = args.balance as number;
        const currency = (args.currency as string) || 'BRL';
        const color = (args.color as string) || 'hsl(var(--accent-primary))';

        dispatch({
            type: 'ADD_ACCOUNT',
            payload: {
                name,
                type,
                balance,
                currency: currency as any,
                color,
                icon: type === 'cash' ? 'Wallet' : type === 'credit' ? 'CreditCard' : 'Building2',
            }
        });

        return JSON.stringify({
            success: true,
            message: `Conta "${name}" criada com sucesso!`,
            account: { name, type, balance, currency }
        });
    };

    // Execute update account balance tool action
    const executeUpdateAccountBalance = (args: Record<string, unknown>): string => {
        const accountName = args.account_name as string;
        const newBalance = args.new_balance as number;

        const accountId = resolveAccountId(accountName);
        const resolvedAccount = state.accounts.find(a => a.id === accountId);

        if (!resolvedAccount) {
            return JSON.stringify({
                success: false,
                message: `Conta "${accountName}" não encontrada.`
            });
        }

        dispatch({
            type: 'UPDATE_ACCOUNT',
            payload: {
                id: accountId,
                updates: { balance: newBalance }
            }
        });

        return JSON.stringify({
            success: true,
            message: `Saldo da conta "${resolvedAccount.name}" atualizado para ${newBalance}.`,
            account: resolvedAccount.name,
            newBalance
        });
    };

    // Process all tool actions from AI response
    const processToolActions = (actions: AIToolAction[]): { toolCallId: string; result: string }[] => {
        const results: { toolCallId: string; result: string }[] = [];

        for (const action of actions) {
            if (action.tool === 'add_transaction') {
                const result = executeAddTransaction(action.args);
                results.push({ toolCallId: action.toolCallId, result });
            } else if (action.tool === 'add_multiple_transactions') {
                const transactions = action.args.transactions as Record<string, unknown>[];
                const allResults: unknown[] = [];

                for (const tx of transactions) {
                    const result = executeAddTransaction(tx);
                    allResults.push(JSON.parse(result));
                }

                results.push({
                    toolCallId: action.toolCallId,
                    result: JSON.stringify({ success: true, count: allResults.length, transactions: allResults }),
                });
            } else if (action.tool === 'create_account') {
                const result = executeCreateAccount(action.args);
                results.push({ toolCallId: action.toolCallId, result });
            } else if (action.tool === 'update_account_balance') {
                const result = executeUpdateAccountBalance(action.args);
                results.push({ toolCallId: action.toolCallId, result });
            }
        }

        return results;
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPendingImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const sendMessage = async (text: string, image?: string) => {
        const messageText = text.trim() || (image ? 'Analise este comprovante para mim.' : '');
        if (!messageText && !image) return;
        if (isLoading) return;

        setInput('');
        setPendingImage(null);

        dispatch({
            type: 'ADD_CHAT_MESSAGE',
            payload: {
                role: 'user',
                content: messageText,
                image: image
            }
        });

        const updatedHistory: OpenRouterHistoryMessage[] = [
            ...chatHistory,
            { role: 'user' as const, content: messageText }
        ];
        setChatHistory(updatedHistory);

        setIsLoading(true);

        try {
            let result: AIChatResult = await aiService.chatWithAssistant(
                messageText,
                state,
                updatedHistory,
                image || undefined
            );

            let iterations = 0;
            while (result.requiresFollowUp && result.toolActions.length > 0 && iterations < 5) {
                iterations++;
                const toolResults = processToolActions(result.toolActions);
                result = await aiService.sendToolResults(result._messages, toolResults);
            }

            const reply = result.text || 'Pronto! Transação registrada com sucesso. ✅';

            dispatch({
                type: 'ADD_CHAT_MESSAGE',
                payload: { role: 'assistant', content: reply }
            });

            setChatHistory(prev => [...prev, { role: 'assistant' as const, content: reply }]);

        } catch (error) {
            console.error(error);
            dispatch({
                type: 'ADD_CHAT_MESSAGE',
                payload: { role: 'assistant', content: 'Ocorreu um erro. Tente novamente.' }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        sendMessage(input, pendingImage || undefined);
    };

    const handleClearChat = () => {
        dispatch({ type: 'CLEAR_CHAT' });
        setChatHistory([]);
    };

    const isAvailable = aiService.isAvailable();

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Abrir Assistente IA"
                className={cn(
                    `fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_0_25px_rgba(var(--accent-glow),0.5)] bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white flex items-center justify-center transition-all duration-300`,
                    isOpen ? 'scale-0 opacity-0' : 'hover:scale-110 active:scale-95'
                )}
            >
                <Sparkles className="h-6 w-6" />
                {messages.length > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[rgb(var(--bg-primary))]">
                        {messages.length > 9 ? '9+' : messages.length}
                    </span>
                )}
            </button>

            <div
                className={cn(
                    'fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] glass border-l border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out sm:m-4 sm:rounded-3xl sm:h-[calc(100vh-2rem)]',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex items-center justify-between p-5 border-b border-[rgba(var(--border-secondary),0.3)] bg-[rgba(var(--bg-secondary),0.3)] rounded-t-3xl backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-xl shadow-lg shadow-indigo-500/20">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Assistente IA</h3>
                            <div className="flex items-center gap-1.5">
                                <span className={cn('w-1.5 h-1.5 rounded-full', isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--text-muted))]">
                                    {isAvailable ? 'Online • Multimodal' : 'Offline • Configure a API Key'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                            <button
                                onClick={handleClearChat}
                                title="Limpar conversa"
                                className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors text-[rgb(var(--text-muted))] hover:text-rose-400"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {!isAvailable && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-400">API Key não configurada</p>
                                <p className="text-xs text-[rgb(var(--text-muted))] mt-1">
                                    Adicione <code className="bg-amber-500/10 px-1 rounded">VITE_OPENROUTER_API_KEY</code> no seu arquivo <code className="bg-amber-500/10 px-1 rounded">.env</code>.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.length === 0 && isAvailable && (
                        <div className="text-center py-8 px-4">
                            <div className="relative inline-block mb-5">
                                <Sparkles className="h-14 w-14 text-[rgb(var(--accent-primary))] animate-float" />
                                <div className="absolute inset-0 blur-2xl bg-[rgb(var(--accent-primary))] opacity-20" />
                            </div>
                            <h4 className="font-display text-lg font-semibold text-[rgb(var(--text-primary))] mb-1">Seu copiloto financeiro</h4>
                            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-6">
                                Envie mensagens ou <strong>fotos de recibos</strong> para lançar gastos automaticamente.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => sendMessage(suggestion)}
                                        className="text-xs px-3 py-2 rounded-full bg-[rgba(var(--accent-primary),0.1)] border border-[rgba(var(--accent-primary),0.25)] text-[rgb(var(--accent-primary))] hover:bg-[rgba(var(--accent-primary),0.2)] transition-colors font-medium"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm',
                                msg.role === 'user'
                                    ? 'bg-[rgb(var(--bg-tertiary))] border border-[rgba(var(--border-primary),0.5)]'
                                    : 'bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white'
                            )}>
                                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div
                                className={cn(
                                    'px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm flex flex-col gap-2',
                                    msg.role === 'user'
                                        ? 'bg-[rgba(var(--bg-tertiary),0.8)] text-[rgb(var(--text-primary))] rounded-tr-none border border-[rgba(var(--border-primary),0.3)]'
                                        : 'bg-[rgba(255,255,255,0.05)] text-[rgb(var(--text-primary))] border border-[rgba(var(--border-secondary),0.3)] rounded-tl-none backdrop-blur-sm'
                                )}
                            >
                                {msg.image && (
                                    <div className="rounded-xl overflow-hidden border border-white/10 mb-1">
                                        <img src={msg.image} alt="Upload" className="w-full h-auto max-h-60 object-cover" />
                                    </div>
                                )}
                                {msg.role === 'assistant' ? (
                                    <span
                                        className="prose prose-sm prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                    />
                                ) : (
                                    msg.content
                                )}
                                <p className="text-[10px] text-[rgb(var(--text-muted))] mt-1 opacity-60">
                                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(var(--border-secondary),0.2)] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-[rgb(var(--accent-primary))]" />
                                <span className="text-xs font-medium text-[rgb(var(--text-muted))] tracking-wide">Analisando...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="p-5 border-t border-[rgba(var(--border-secondary),0.2)] bg-[rgba(var(--bg-secondary),0.2)] rounded-b-3xl shrink-0 space-y-3">
                    {pendingImage && (
                        <div className="relative inline-block group">
                            <img src={pendingImage} className="w-20 h-20 object-cover rounded-xl border-2 border-[rgb(var(--accent-primary))] shadow-lg shadow-indigo-500/20" />
                            <button
                                onClick={() => setPendingImage(null)}
                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <div className="relative flex-1 group">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isAvailable ? 'Lançar gastos, enviar foto...' : 'Configure a API Key'}
                                disabled={isLoading || !isAvailable}
                                className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-[rgba(var(--bg-card),0.5)] border border-[rgba(var(--border-primary),0.4)] backdrop-blur-md focus:ring-2 focus:ring-[rgb(var(--accent-primary))] focus:border-transparent outline-none transition-all text-[rgb(var(--text-primary))] group-hover:border-[rgba(var(--accent-primary),0.3)] disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading || !isAvailable}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                                title="Anexar foto do recibo"
                            >
                                <Camera className="h-5 w-5" />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />

                        <button
                            type="submit"
                            disabled={(!input.trim() && !pendingImage) || isLoading || !isAvailable}
                            className="p-3.5 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataImportExport } from '@/components/features/DataImportExport';
import { Moon, Sun, Monitor, Globe, Trash2, AlertCircle, Save, Key, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Settings() {
    const { theme, setTheme } = useTheme();
    const { state, dispatch } = useApp();
    const { showToast } = useToast();
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
    const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_OPENROUTER_API_KEY || '');
    const [apiKeySaved, setApiKeySaved] = useState(false);

    const handleResetData = () => {
        localStorage.clear();
        window.location.reload();
    };

    const handleCurrencyChange = (currency: string) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { defaultCurrency: currency as 'BRL' | 'USD' | 'EUR' | 'GBP' } });
    };

    const handleLanguageChange = (language: string) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { language: language as 'pt-BR' | 'en-US' } });
    };

    const handleSave = () => {
        showToast('Configurações salvas com sucesso!', 'success');
        setApiKeySaved(false);
    };

    const handleApiKeyInfo = () => {
        showToast('Para usar a IA, adicione VITE_OPENROUTER_API_KEY no arquivo .env e reinicie o servidor.', 'info');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div>
                <h2 className="text-3xl font-display font-bold text-[rgb(var(--text-primary))]">Configurações</h2>
                <p className="text-[rgb(var(--text-muted))] mt-1 text-sm tracking-wide">Personalize sua experiência no Financeiro AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Settings */}
                <Card variant="glass" className="border-[rgba(var(--border-primary),0.3)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[rgb(var(--text-primary))]">
                            <Sun className="h-5 w-5 text-amber-500" />
                            Aparência
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Tema do Sistema</label>
                            <div className="grid grid-cols-3 gap-3">
                                {([
                                    { value: 'light', label: 'Claro', icon: <Sun className="h-5 w-5" /> },
                                    { value: 'dark', label: 'Escuro', icon: <Moon className="h-5 w-5" /> },
                                    { value: 'system', label: 'Auto', icon: <Monitor className="h-5 w-5" /> },
                                ] as const).map(({ value, label, icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTheme(value)}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300',
                                            theme === value
                                                ? 'bg-[rgba(var(--accent-primary),0.1)] border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))]'
                                                : 'bg-[rgba(var(--bg-secondary),0.3)] border-[rgba(var(--border-primary),0.3)] text-[rgb(var(--text-muted))]'
                                        )}
                                    >
                                        {icon}
                                        <span className="text-xs font-semibold">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card variant="glass" className="border-[rgba(var(--border-primary),0.3)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[rgb(var(--text-primary))]">
                            <Globe className="h-5 w-5 text-[rgb(var(--accent-secondary))]" />
                            Regional
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Moeda padrão</label>
                            <Select
                                value={state.settings.defaultCurrency}
                                onChange={(e) => handleCurrencyChange(e.target.value)}
                                options={[
                                    { value: 'BRL', label: 'Real Brasileiro (R$)' },
                                    { value: 'USD', label: 'Dólar Americano ($)' },
                                    { value: 'EUR', label: 'Euro (€)' },
                                    { value: 'GBP', label: 'Libra Esterlina (£)' },
                                ]}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Idioma</label>
                            <Select
                                value={state.settings.language}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                options={[
                                    { value: 'pt-BR', label: '🇧🇷 Português (BR)' },
                                    { value: 'en-US', label: '🇺🇸 English (US)' },
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* AI Settings */}
                <Card variant="glass" className="md:col-span-2 border-[rgba(var(--accent-primary),0.15)] shadow-[0_10px_30px_-10px_rgba(var(--accent-primary),0.2)]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[rgb(var(--text-primary))]">
                            <Key className="h-5 w-5 text-[rgb(var(--accent-primary))]" />
                            Assistente de IA (OpenRouter)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-[rgb(var(--text-muted))]">
                            O assistente usa a API do OpenRouter. A chave é lida do arquivo <code className="bg-[rgba(var(--bg-tertiary),0.5)] px-1.5 py-0.5 rounded text-xs font-mono">.env</code> na variável <code className="bg-[rgba(var(--bg-tertiary),0.5)] px-1.5 py-0.5 rounded text-xs font-mono">VITE_OPENROUTER_API_KEY</code>.
                        </p>

                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-[rgba(var(--border-primary),0.3)] bg-[rgba(var(--bg-tertiary),0.2)]">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Status da API Key</p>
                                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                                    {import.meta.env.VITE_OPENROUTER_API_KEY && import.meta.env.VITE_OPENROUTER_API_KEY !== 'your_openrouter_key_here'
                                        ? '✅ Chave configurada e ativa'
                                        : '❌ Chave não encontrada no .env'}
                                </p>
                            </div>
                            {import.meta.env.VITE_OPENROUTER_API_KEY && import.meta.env.VITE_OPENROUTER_API_KEY !== 'your_openrouter_key_here' ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                            ) : (
                                <Button variant="secondary" size="sm" onClick={handleApiKeyInfo}>
                                    Como configurar
                                </Button>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-[rgba(var(--accent-primary),0.05)] border border-[rgba(var(--accent-primary),0.15)]">
                            <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed">
                                <strong className="text-[rgb(var(--text-secondary))]">Como configurar:</strong><br />
                                1. Acesse <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[rgb(var(--accent-primary))] underline">openrouter.ai/keys</a> e crie uma chave<br />
                                2. Adicione no <code className="font-mono">.env</code>: <code className="font-mono">VITE_OPENROUTER_API_KEY=sua_chave</code><br />
                                3. Opcionalmente defina o modelo: <code className="font-mono">VITE_OPENROUTER_MODEL=google/gemini-2.0-flash-001</code><br />
                                4. Reinicie o servidor de desenvolvimento
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Import / Export */}
                <DataImportExport />

                {/* Data Management */}
                <Card variant="glass" className="md:col-span-2 border-[rgba(var(--border-primary),0.3)]">
                    <CardHeader>
                        <CardTitle className="text-[rgb(var(--text-primary))]">Dados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <div className="flex items-center gap-4">
                                <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">Limpar Todos os Dados</h4>
                                    <p className="text-sm text-[rgb(var(--text-muted))]">
                                        Apaga permanentemente todas as transações, contas e configurações.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                onClick={() => setIsConfirmResetOpen(true)}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            >
                                Resetar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4 border-t border-[rgba(var(--border-primary),0.3)]">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    className="px-10 h-12"
                    leftIcon={<Save className="h-4 w-4" />}
                >
                    Salvar Configurações
                </Button>
            </div>

            <ConfirmDialog
                isOpen={isConfirmResetOpen}
                onClose={() => setIsConfirmResetOpen(false)}
                onConfirm={handleResetData}
                title="Resetar todos os dados?"
                message="Esta ação é irreversível. Todas as transações, contas e configurações serão apagadas permanentemente."
                confirmLabel="Sim, resetar tudo"
                variant="danger"
            />
        </div>
    );
}

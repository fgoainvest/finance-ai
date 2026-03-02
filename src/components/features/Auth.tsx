import { useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/contexts/ToastContext';
import { LogIn, UserPlus, Loader2, Mail, Lock } from 'lucide-react';

export function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabaseService.signIn(email, password);
                if (error) throw error;
                showToast('Bem-vindo de volta!', 'success');
            } else {
                const { error } = await supabaseService.signUp(email, password);
                if (error) throw error;
                showToast('Conta criada! Verifique seu e-mail.', 'success');
            }
        } catch (error: any) {
            showToast(error.message || 'Erro na autenticação', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto min-h-screen">
            <div className="glass p-8 rounded-3xl w-full border border-border-primary shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent-primary/20">
                        {isLogin ? <LogIn className="text-white h-8 w-8" /> : <UserPlus className="text-white h-8 w-8" />}
                    </div>
                    <h2 className="text-2xl font-display font-bold text-text-primary">
                        {isLogin ? 'Bem-vindo' : 'Criar Conta'}
                    </h2>
                    <p className="text-text-muted text-sm mt-2 text-center">
                        {isLogin ? 'Entre para sincronizar suas finanças' : 'Comece a organizar sua vida financeira'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary ml-1">E-mail</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-secondary border border-border-primary rounded-2xl py-3.5 pl-12 pr-4 text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all placeholder:text-text-muted"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary ml-1">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                            <input
                                type="password"
                                required
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-bg-secondary border border-border-primary rounded-2xl py-3.5 pl-12 pr-4 text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all placeholder:text-text-muted"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-2xl py-4 font-semibold shadow-lg shadow-accent-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-border-secondary">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-accent-primary hover:text-accent-secondary text-sm font-medium transition-colors"
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
                    </button>
                </div>
            </div>
        </div>
    );
}

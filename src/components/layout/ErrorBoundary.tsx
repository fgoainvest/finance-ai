import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center p-6 text-white font-display">
                    <Card variant="glass" className="max-w-md w-full border-[rgba(var(--expense),0.3)] shadow-[0_0_50px_rgba(var(--expense),0.1)]">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-[rgba(var(--expense),0.1)] rounded-3xl flex items-center justify-center mx-auto border border-[rgba(var(--expense),0.2)] shadow-[inset_0_0_20px_rgba(var(--expense),0.1)]">
                                <AlertTriangle className="h-10 w-10 text-[rgb(var(--expense))]" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight">Eita! Algo deu errado.</h1>
                                <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                                    Sentimos muito por isso. Um erro inesperado aconteceu na interface do sistema.
                                </p>
                            </div>

                            {this.state.error && (
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/10 text-left overflow-auto max-h-32 text-xs font-mono text-[rgb(var(--text-muted))]">
                                    {this.state.error.message}
                                </div>
                            )}

                            <Button
                                onClick={this.handleReset}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[rgb(var(--expense))] to-[rgb(var(--accent-secondary))] hover:shadow-[0_0_20px_rgba(var(--expense),0.3)] border-none transition-all duration-300"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Recarregar Sistema
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

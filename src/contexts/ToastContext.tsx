import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-[rgb(var(--income))]" />;
            case 'error': return <XCircle className="h-5 w-5 text-[rgb(var(--expense))]" />;
            case 'warning': return <AlertCircle className="h-5 w-5 text-amber-500" />;
            case 'info': return <Info className="h-5 w-5 text-[rgb(var(--accent-primary))]" />;
        }
    };

    const getTypeClasses = (type: ToastType) => {
        switch (type) {
            case 'success': return 'border-[rgba(var(--income),0.3)] shadow-[0_0_20px_rgba(var(--income),0.1)]';
            case 'error': return 'border-[rgba(var(--expense),0.3)] shadow-[0_0_20px_rgba(var(--expense),0.1)]';
            case 'warning': return 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]';
            case 'info': return 'border-[rgba(var(--accent-primary),0.3)] shadow-[0_0_20px_rgba(var(--accent-primary),0.1)]';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-24 md:bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className={`pointer-events-auto min-w-[300px] max-w-md glass p-4 rounded-2xl flex items-center justify-between gap-4 border ${getTypeClasses(toast.type)}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    {getIcon(toast.type)}
                                </div>
                                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

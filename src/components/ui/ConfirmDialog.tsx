import { Modal, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary' | 'success';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger'
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="space-y-6">
                <div className="flex items-start gap-4 p-1">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${variant === 'danger' ? 'bg-[rgba(var(--expense),0.1)] border border-[rgba(var(--expense),0.2)] text-[rgb(var(--expense))]' :
                            variant === 'success' ? 'bg-[rgba(var(--income),0.1)] border border-[rgba(var(--income),0.2)] text-[rgb(var(--income))]' :
                                'bg-[rgba(var(--accent-primary),0.1)] border border-[rgba(var(--accent-primary),0.2)] text-[rgb(var(--accent-primary))]'
                        }`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[rgb(var(--text-secondary))] leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 rounded-2xl py-6"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : 'primary'}
                        onClick={handleConfirm}
                        className="flex-1 rounded-2xl py-6"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

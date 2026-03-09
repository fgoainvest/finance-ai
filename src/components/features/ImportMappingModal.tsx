import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, Wand2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiService } from '@/services/ai';
import { ExcelService } from '@/services/ExcelService';
import type { ExcelRow, ColumnMapping } from '@/services/ExcelService';

interface ImportMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    headers: string[];
    rows: ExcelRow[];
    onConfirm: (mappedRows: ExcelRow[], mappings: ColumnMapping[]) => void;
}

const SYSTEM_FIELDS: { value: string; label: string }[] = [
    { value: 'date', label: 'Data' },
    { value: 'description', label: 'Descrição' },
    { value: 'amount', label: 'Valor' },
    { value: 'type', label: 'Tipo (Receita/Despesa)' },
    { value: 'categoryId', label: 'Categoria' },
    { value: 'accountId', label: 'Conta' },
    { value: 'notes', label: 'Observações' },
    { value: 'ignore', label: 'Ignorar esta coluna' },
];

export function ImportMappingModal({ isOpen, onClose, headers, rows, onConfirm }: ImportMappingModalProps) {
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [previewRows, setPreviewRows] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && headers.length > 0) {
            // Initial mapping: try to find exact matches or set all to ignore
            const initial = headers.map(h => ({
                fileColumn: h,
                systemField: 'ignore' as any
            }));
            setMappings(initial);
            handleAutoSuggest(initial);
        }
    }, [isOpen, headers]);

    const handleAutoSuggest = async (currentMappings: ColumnMapping[]) => {
        setIsSuggesting(true);
        try {
            const systemFieldNames = SYSTEM_FIELDS.map(f => f.value).filter(v => v !== 'ignore');
            const suggestions = await aiService.suggestColumnMapping(headers, systemFieldNames);

            setMappings(currentMappings.map(m => ({
                ...m,
                systemField: (suggestions[m.fileColumn] as any) || m.systemField
            })));
        } catch (error) {
            console.error('Mapping suggestion failed:', error);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleMappingChange = (fileColumn: string, systemField: string) => {
        setMappings(prev => prev.map(m =>
            m.fileColumn === fileColumn ? { ...m, systemField: systemField as any } : m
        ));
    };

    const handleConfirm = () => {
        // Validation: Must have at least description, amount and date
        const mappedFields = mappings.map(m => m.systemField);
        if (!mappedFields.includes('description') || !mappedFields.includes('amount')) {
            alert('Por favor, mapeie pelo menos a Descrição e o Valor.');
            return;
        }

        onConfirm(rows, mappings);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="w-full max-w-4xl glass shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 transition-all">
                {/* Header */}
                <div className="p-6 border-b border-border-secondary flex items-center justify-between bg-bg-secondary/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/10 rounded-xl">
                            <Wand2 className="h-5 w-5 text-accent-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-semibold">Mapear Colunas do Excel</h2>
                            <p className="text-sm text-text-muted">A IA sugeriu o mapeamento. Revise e confirme abaixo.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {isSuggesting && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 animate-pulse">
                            <Loader2 className="h-5 w-5 text-accent-primary animate-spin" />
                            <p className="text-sm font-medium text-accent-primary">IA analisando cabeçalhos...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mapping List */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-500" />
                                Configurar Mapeamento
                            </h3>
                            <div className="space-y-3">
                                {mappings.map((mapping) => (
                                    <div key={mapping.fileColumn} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-bg-secondary/50 border border-border-primary/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-text-muted truncate max-w-[150px]">
                                                {mapping.fileColumn}
                                            </span>
                                            <ArrowRight className="h-3 w-3 text-text-muted opacity-30" />
                                        </div>
                                        <select
                                            value={mapping.systemField}
                                            onChange={(e) => handleMappingChange(mapping.fileColumn, e.target.value)}
                                            className="w-full bg-bg-card border border-border-primary rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all font-medium"
                                        >
                                            {SYSTEM_FIELDS.map(field => (
                                                <option key={field.value} value={field.value}>
                                                    {field.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Preview / Tips */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-indigo-400">
                                <Info className="h-4 w-4" />
                                Visualização dos Dados
                            </h3>
                            <div className="bg-bg-primary/50 rounded-2xl border border-border-primary/50 p-4 h-[300px] overflow-hidden flex flex-col">
                                <div className="text-xs text-text-muted mb-4 leading-relaxed">
                                    Baseado nas primeiras 3 linhas do seu arquivo.
                                    Verifique se o <strong>Valor</strong> e a <strong>Data</strong> foram identificados corretamente.
                                </div>
                                <div className="flex-1 overflow-auto rounded-xl border border-border-secondary">
                                    <table className="w-full text-[10px] text-left border-collapse">
                                        <thead className="sticky top-0 bg-bg-secondary z-10">
                                            <tr>
                                                {headers.slice(0, 4).map(h => (
                                                    <th key={h} className="p-2 font-bold border-b border-border-secondary uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.slice(0, 5).map((row, i) => (
                                                <tr key={i} className="hover:bg-bg-tertiary/30 transition-colors">
                                                    {headers.slice(0, 4).map(h => (
                                                        <td key={h} className="p-2 border-b border-border-secondary/50 truncate max-w-[80px]">{row[h]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-normal">
                                    <strong>Dica:</strong> Se o valor tiver símbolos de moeda (R$), não se preocupe, o sistema irá removê-los automaticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-secondary flex items-center justify-between bg-bg-secondary/30">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-2xl border border-border-primary hover:bg-bg-tertiary transition-all text-sm font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-2.5 rounded-2xl bg-accent-primary text-white hover:scale-105 active:scale-95 transition-all text-sm font-bold shadow-lg shadow-accent-primary/25"
                    >
                        Confirmar e Importar
                    </button>
                </div>
            </div>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
    );
}

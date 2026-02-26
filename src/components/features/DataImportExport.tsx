import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    Download, Upload, FileSpreadsheet, CheckCircle2, XCircle,
    AlertTriangle, Loader2,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TransactionType, CurrencyCode } from '@/types';

// ---------- types ----------
interface ParsedRow {
    row: number;
    description: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    date: string;
    currency: CurrencyCode;
    notes: string;
    categoryLabel: string;
    accountLabel: string;
    warnings: string[];
}

interface ImportResult {
    valid: ParsedRow[];
    errors: { row: number; message: string }[];
    total: number;
}

export function DataImportExport() {
    const { state, dispatch } = useApp();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // ---- resolve helpers ----

    const resolveCategory = (name: string, type: string) => {
        const cats = state.categories.filter(c => c.type === type);
        const exact = cats.find(c => c.name.toLowerCase() === String(name).toLowerCase());
        if (exact) return exact;
        const partial = cats.find(c => String(name).toLowerCase().includes(c.name.toLowerCase()));
        if (partial) return partial;
        const other = cats.find(c => c.name === 'Outros');
        return other ?? cats[0] ?? null;
    };

    const resolveAccount = (name: string) => {
        const exact = state.accounts.find(a => a.name.toLowerCase() === String(name).toLowerCase());
        if (exact) return exact;
        const partial = state.accounts.find(a =>
            a.name.toLowerCase().includes(String(name).toLowerCase()) ||
            String(name).toLowerCase().includes(a.name.toLowerCase())
        );
        return partial ?? state.accounts[0] ?? null;
    };

    const parseType = (raw: string): TransactionType | null => {
        const v = String(raw).toLowerCase().trim();
        if (['receita', 'income', 'entrada', 'recebido', 'recebimento', 'crédito', 'credito'].includes(v)) return 'income';
        if (['despesa', 'expense', 'gasto', 'saida', 'saída', 'débito', 'debito', 'pagamento'].includes(v)) return 'expense';
        if (['transferencia', 'transferência', 'transfer'].includes(v)) return 'transfer';
        return null;
    };

    const parseDate = (raw: unknown): string => {
        if (raw instanceof Date && !isNaN(raw.getTime())) {
            return raw.toISOString();
        }
        const s = String(raw ?? '').trim();
        if (!s || s === '' || s === 'undefined') return new Date().toISOString();

        // XLSX serial number (e.g. 45678)
        if (/^\d{5}$/.test(s)) {
            const d = XLSX.SSF.parse_date_code(parseFloat(s));
            if (d) return new Date(d.y, d.m - 1, d.d, 12).toISOString();
        }

        // ISO YYYY-MM-DD or YYYY/MM/DD
        if (/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(s)) {
            const d = new Date(s.replace(/\//g, '-') + 'T12:00:00');
            if (!isNaN(d.getTime())) return d.toISOString();
        }

        // DD/MM/YYYY or DD-MM-YYYY
        const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
        if (match) {
            const [, dd, mm, yyyy] = match;
            const year = yyyy.length === 2 ? `20${yyyy}` : yyyy;
            const d = new Date(`${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T12:00:00`);
            if (!isNaN(d.getTime())) return d.toISOString();
        }

        // Attempt generic parse
        const d = new Date(s);
        if (!isNaN(d.getTime())) return d.toISOString();

        return new Date().toISOString();
    };

    // ---- process rows ----

    const processRows = (rows: Record<string, unknown>[]): ImportResult => {
        const valid: ParsedRow[] = [];
        const errors: { row: number; message: string }[] = [];

        rows.forEach((row, idx) => {
            const rowNum = idx + 2;
            const rowErrors: string[] = [];

            const get = (keys: string[]): string => {
                for (const k of keys) {
                    const found = Object.keys(row).find(
                        rk => rk.toLowerCase().trim() === k.toLowerCase()
                    );
                    if (found !== undefined && row[found] !== undefined && row[found] !== '') {
                        return String(row[found]).trim();
                    }
                }
                return '';
            };

            const rawDesc = get(['descrição', 'descricao', 'description', 'desc', 'nome', 'name']);
            const rawAmount = get(['valor', 'amount', 'value', 'quantia', 'preço', 'preco', 'price']);
            const rawType = get(['tipo', 'type', 'kind', 'category_type', 'categoria_tipo']);
            const rawCat = get(['categoria', 'category', 'cat']);
            const rawAcc = get(['conta', 'account', 'banco', 'bank', 'wallet']);
            const rawDate = get(['data', 'date', 'dt', 'Data', 'Date']);
            const rawCurrency = get(['moeda', 'currency', 'Money', 'mon']);
            const rawNotes = get(['notas', 'notes', 'observações', 'observacoes', 'obs', 'memo', 'note']);

            if (!rawDesc) rowErrors.push('Descrição em branco');

            const rawAmountClean = String(rawAmount).replace(/\s/g, '').replace(',', '.');
            const amount = parseFloat(rawAmountClean);
            if (isNaN(amount) || amount <= 0) rowErrors.push(`Valor inválido: "${rawAmount}"`);

            const type = parseType(rawType);
            if (!type) rowErrors.push(`Tipo inválido: "${rawType}" — use Receita ou Despesa`);

            if (rowErrors.length > 0) {
                errors.push({ row: rowNum, message: rowErrors.join('; ') });
                return;
            }

            const warnings: string[] = [];

            const catObj = resolveCategory(rawCat, type!);
            const accObj = resolveAccount(rawAcc);

            if (!catObj) warnings.push(`Categoria "${rawCat}" não encontrada`);
            if (!accObj) warnings.push(`Conta "${rawAcc}" não encontrada`);

            const currencies: CurrencyCode[] = ['BRL', 'USD', 'EUR', 'GBP'];
            const currencyUp = rawCurrency.toUpperCase() as CurrencyCode;
            const currency: CurrencyCode = currencies.includes(currencyUp) ? currencyUp : 'BRL';

            // Handle date: get raw cell value first
            const rawDateCell = (() => {
                for (const k of ['data', 'date', 'dt', 'Data', 'Date']) {
                    const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase());
                    if (found !== undefined) return row[found];
                }
                return undefined;
            })();

            valid.push({
                row: rowNum,
                description: rawDesc,
                amount,
                type: type!,
                categoryId: catObj?.id ?? '',
                categoryLabel: catObj?.name ?? (rawCat || 'Outros'),
                accountId: accObj?.id ?? '',
                accountLabel: accObj?.name ?? (rawAcc || (state.accounts[0]?.name ?? '?')),
                date: parseDate(rawDateCell ?? rawDate),
                currency,
                notes: rawNotes,
                warnings,
            });
        });

        return { valid, errors, total: rows.length };
    };

    // ---- file handling ----

    const handleFile = (file: File) => {
        if (!file) return;
        setIsLoading(true);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
                    defval: '',
                    raw: false,       // convert dates to strings via dateNF
                    dateNF: 'yyyy-mm-dd',
                });
                if (rows.length === 0) {
                    showToast('A planilha está vazia ou sem linhas de dados.', 'error');
                    setIsLoading(false);
                    return;
                }
                const result = processRows(rows);
                setImportResult(result);
            } catch (err) {
                console.error('XLSX parse error:', err);
                showToast('Erro ao ler o arquivo. Verifique se é um .xlsx ou .csv válido.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            showToast('Erro ao ler o arquivo.', 'error');
            setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    // ---- confirm import ----

    const handleConfirmImport = () => {
        if (!importResult || importResult.valid.length === 0) return;

        // Use the new batch action which handles auto-creation of missing accounts/categories
        // We pass the entire list of valid parsed rows.
        dispatch({
            type: 'BATCH_IMPORT_TRANSACTIONS',
            payload: importResult.valid
        });

        showToast(`${importResult.valid.length} transações processadas com sucesso! 🎉`, 'success');
        setImportResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ---- export ----

    const handleExport = () => {
        if (state.transactions.length === 0) {
            showToast('Nenhuma transação para exportar.', 'info');
            return;
        }
        const rows = state.transactions.map(t => {
            const cat = state.categories.find(c => c.id === t.categoryId);
            const acc = state.accounts.find(a => a.id === t.accountId);
            return {
                Data: t.date.slice(0, 10),
                Tipo: t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
                Descrição: t.description,
                Valor: t.amount,
                Categoria: cat?.name ?? '',
                Conta: acc?.name ?? '',
                Moeda: t.currency,
                Notas: t.notes ?? '',
            };
        });
        const ws = XLSX.utils.json_to_sheet(rows, {
            header: ['Data', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Conta', 'Moeda', 'Notas'],
        });
        ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 35 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 8 }, { wch: 30 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transações');
        XLSX.writeFile(wb, `financeiro-ai-${new Date().toISOString().slice(0, 10)}.xlsx`);
        showToast(`${rows.length} transações exportadas!`, 'success');
    };

    const handleDownloadTemplate = () => {
        const catList = state.categories.map(c => `${c.name}`).join(', ');
        const accList = state.accounts.map(a => a.name).join(', ');

        const example = [
            {
                Data: new Date().toISOString().slice(0, 10),
                Tipo: 'Despesa',
                Descrição: 'Supermercado Extra',
                Valor: 150.50,
                Categoria: 'Alimentação',
                Conta: state.accounts[0]?.name ?? 'Carteira',
                Moeda: 'BRL',
                Notas: 'Compras da semana',
            },
            {
                Data: new Date().toISOString().slice(0, 10),
                Tipo: 'Receita',
                Descrição: 'Salário',
                Valor: 3500.00,
                Categoria: 'Salário',
                Conta: state.accounts[1]?.name ?? state.accounts[0]?.name ?? 'Conta Corrente',
                Moeda: 'BRL',
                Notas: '',
            },
        ];
        const ws = XLSX.utils.json_to_sheet(example, {
            header: ['Data', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Conta', 'Moeda', 'Notas'],
        });
        ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 35 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 8 }, { wch: 30 }];

        const wsInfo = XLSX.utils.aoa_to_sheet([
            ['Campo', 'Valores aceitos', 'Obrigatório'],
            ['Data', 'YYYY-MM-DD ou DD/MM/YYYY', 'Sim'],
            ['Tipo', 'Receita, Despesa', 'Sim'],
            ['Descrição', 'Texto livre', 'Sim'],
            ['Valor', 'Número (ex: 150.50)', 'Sim'],
            ['Categoria', catList, 'Sim'],
            ['Conta', accList, 'Sim'],
            ['Moeda', 'BRL, USD, EUR, GBP', 'Não'],
            ['Notas', 'Texto livre', 'Não'],
        ]);
        wsInfo['!cols'] = [{ wch: 14 }, { wch: 60 }, { wch: 12 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transações');
        XLSX.utils.book_append_sheet(wb, wsInfo, 'Instruções');
        XLSX.writeFile(wb, 'financeiro-ai-modelo.xlsx');
        showToast('Modelo baixado! Preencha e importe.', 'info');
    };

    // ---- render ----

    const hasResult = importResult !== null;
    const validCount = importResult?.valid.length ?? 0;
    const errorCount = importResult?.errors.length ?? 0;
    const warnCount = importResult?.valid.filter(r => r.warnings.length > 0).length ?? 0;

    return (
        <Card variant="glass" className="md:col-span-2 border-[rgba(var(--accent-secondary),0.2)]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[rgb(var(--text-primary))]">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    Importar / Exportar Planilha
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* ── Export row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[rgba(var(--bg-tertiary),0.35)] border border-[rgba(var(--border-primary),0.3)]">
                        <div>
                            <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Exportar dados</p>
                            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                                {state.transactions.length} transaç{state.transactions.length !== 1 ? 'ões' : 'ão'} disponíve{state.transactions.length !== 1 ? 'is' : 'l'}
                            </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleExport} disabled={state.transactions.length === 0} leftIcon={<Download className="h-4 w-4" />}>
                            Baixar .xlsx
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[rgba(var(--bg-tertiary),0.35)] border border-[rgba(var(--border-primary),0.3)]">
                        <div>
                            <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">Baixar modelo</p>
                            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">
                                Planilha pré-formatada com exemplos e instruções
                            </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleDownloadTemplate} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
                            Baixar modelo
                        </Button>
                    </div>
                </div>

                {/* ── Dropzone ── */}
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))] mb-3">Importar planilha</p>
                    <div
                        role="button"
                        tabIndex={0}
                        className={cn(
                            'relative flex flex-col items-center gap-4 py-10 px-6 rounded-2xl border-2 border-dashed text-center cursor-pointer outline-none transition-all duration-200',
                            isDragging
                                ? 'border-[rgb(var(--accent-primary))] bg-[rgba(var(--accent-primary),0.08)] scale-[1.01]'
                                : 'border-[rgba(var(--border-primary),0.4)] hover:border-[rgba(var(--accent-primary),0.5)] hover:bg-[rgba(var(--accent-primary),0.04)]'
                        )}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={handleFileChange} />

                        {isLoading ? (
                            <>
                                <Loader2 className="h-10 w-10 text-[rgb(var(--accent-primary))] animate-spin" />
                                <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Processando arquivo…</p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 rounded-2xl bg-[rgba(var(--accent-primary),0.1)] text-[rgb(var(--accent-primary))]">
                                    <Upload className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                                        Arraste o arquivo aqui ou clique para selecionar
                                    </p>
                                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">Suporta .xlsx, .xls e .csv</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Preview / Results ── */}
                {hasResult && (
                    <div className="space-y-4 animate-in fade-in duration-200">

                        {/* Summary pills */}
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {validCount} válida{validCount !== 1 ? 's' : ''}
                            </span>
                            {errorCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {errorCount} com erro
                                </span>
                            )}
                            {warnCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {warnCount} com avisos
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(var(--bg-tertiary),0.5)] border border-[rgba(var(--border-primary),0.3)] text-[rgb(var(--text-muted))] text-xs">
                                {importResult?.total} linha{importResult?.total !== 1 ? 's' : ''} lida{importResult?.total !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Errors list */}
                        {errorCount > 0 && (
                            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 divide-y divide-rose-500/10 max-h-40 overflow-y-auto">
                                <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-rose-400">Erros encontrados</p>
                                {importResult!.errors.map(err => (
                                    <div key={err.row} className="px-4 py-2 text-xs flex gap-2">
                                        <span className="text-rose-400 font-bold shrink-0">Linha {err.row}:</span>
                                        <span className="text-[rgb(var(--text-muted))]">{err.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Preview table — always visible after parse */}
                        {validCount > 0 && (
                            <div className="rounded-2xl border border-[rgba(var(--border-primary),0.35)] overflow-hidden">
                                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                                    <table className="w-full text-xs min-w-[600px]">
                                        <thead>
                                            <tr className="sticky top-0 z-10 bg-[rgb(var(--bg-secondary))] border-b border-[rgba(var(--border-primary),0.3)]">
                                                {['#', 'Data', 'Tipo', 'Descrição', 'Valor', 'Categoria', 'Conta'].map(h => (
                                                    <th key={h} className="px-3 py-3 text-left font-bold uppercase tracking-wider text-[rgb(var(--text-muted))] whitespace-nowrap">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgba(var(--border-primary),0.1)]">
                                            {importResult!.valid.map((r, i) => (
                                                <tr
                                                    key={r.row}
                                                    className={cn(
                                                        'transition-colors hover:bg-[rgba(var(--bg-tertiary),0.4)]',
                                                        r.warnings.length > 0 && 'bg-amber-500/5'
                                                    )}
                                                >
                                                    <td className="px-3 py-2.5 text-[rgb(var(--text-muted))] font-mono">{i + 1}</td>
                                                    <td className="px-3 py-2.5 text-[rgb(var(--text-muted))] whitespace-nowrap font-mono">
                                                        {r.date.slice(0, 10)}
                                                    </td>
                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                        <span className={cn(
                                                            'px-2 py-0.5 rounded-full text-[10px] font-bold',
                                                            r.type === 'income'
                                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                                : r.type === 'expense'
                                                                    ? 'bg-rose-500/15 text-rose-400'
                                                                    : 'bg-blue-500/15 text-blue-400'
                                                        )}>
                                                            {r.type === 'income' ? 'Receita' : r.type === 'expense' ? 'Despesa' : 'Transfer.'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[rgb(var(--text-primary))] max-w-[200px] truncate">
                                                        {r.description}
                                                        {r.warnings.length > 0 && (
                                                            <span title={r.warnings.join('; ')}><AlertTriangle className="inline h-3 w-3 text-amber-400 ml-1" /></span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5 font-semibold text-[rgb(var(--text-primary))] whitespace-nowrap">
                                                        R$ {r.amount.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[rgb(var(--text-muted))] whitespace-nowrap">
                                                        {r.categoryLabel}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[rgb(var(--text-muted))] whitespace-nowrap">
                                                        {r.accountLabel}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 pt-1">
                            <Button
                                variant="primary"
                                onClick={handleConfirmImport}
                                disabled={validCount === 0}
                                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                            >
                                Importar {validCount} transaç{validCount === 1 ? 'ão' : 'ões'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setImportResult(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

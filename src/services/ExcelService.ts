import * as XLSX from 'xlsx';
import type { Transaction, Account, Category } from '@/types';

export interface ExcelRow {
    [key: string]: any;
}

export interface ColumnMapping {
    fileColumn: string;
    systemField: keyof Transaction | 'ignore';
}

export const ExcelService = {
    /**
     * Export transactions to an Excel file
     */
    exportTransactions: (transactions: Transaction[], accounts: Account[], categories: Category[]) => {
        const data = transactions.map(t => {
            const account = accounts.find(a => a.id === t.accountId);
            const category = categories.find(c => c.id === t.categoryId);

            return {
                Data: new Date(t.date).toLocaleDateString('pt-BR'),
                Descrição: t.description,
                Valor: t.amount,
                Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
                Categoria: category?.name || 'Sem Categoria',
                Conta: account?.name || 'Desconhecida',
                Notas: t.notes || ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `financeiro-export-${date}.xlsx`);
    },

    /**
     * Parse an Excel file and return the raw rows and headers
     */
    parseExcel: async (file: File): Promise<{ headers: string[], rows: ExcelRow[] }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    const rows = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
                    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

                    resolve({ headers, rows });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Map Excel rows to Transaction objects based on user-approved mapping
     */
    mapRowsToTransactions: (
        rows: ExcelRow[],
        mapping: ColumnMapping[],
        userId: string,
        defaultAccountId: string,
        defaultCategoryId: string
    ): Partial<Transaction>[] => {
        return rows.map(row => {
            const transaction = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                description: '',
                amount: 0,
                type: 'expense' as const,
                accountId: defaultAccountId,
                categoryId: defaultCategoryId,
                currency: 'BRL' as const,
                isRecurring: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as any;

            mapping.forEach(map => {
                if (map.systemField === 'ignore') return;

                const value = row[map.fileColumn];
                if (value === undefined || value === null) return;

                if (map.systemField === 'amount') {
                    transaction.amount = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.,-]/g, '').replace(',', '.'));
                } else if (map.systemField === 'date') {
                    // Try to parse date
                    const parsedDate = new Date(value);
                    if (!isNaN(parsedDate.getTime())) {
                        transaction.date = parsedDate.toISOString();
                    }
                } else if (map.systemField === 'type') {
                    const val = String(value).toLowerCase();
                    if (val.includes('receita') || val.includes('income') || val.includes('entrada')) {
                        transaction.type = 'income';
                    } else {
                        transaction.type = 'expense';
                    }
                } else {
                    transaction[map.systemField] = value;
                }
            });

            return transaction;
        });
    }
};

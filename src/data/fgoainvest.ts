import type { Account } from '@/types';

export const FGOA_ACCOUNTS: Account[] = [
    { id: 'acc_picpay', name: 'Picpay', type: 'bank', balance: 2062.91, currency: 'BRL', color: '#22C55E', icon: 'Wallet' },
    { id: 'acc_99pay', name: '99Pay', type: 'bank', balance: 297.30, currency: 'BRL', color: '#FACC15', icon: 'Smartphone' },
    { id: 'acc_mercadopago', name: 'Mercado Pago', type: 'bank', balance: -2391.33, currency: 'BRL', color: '#3B82F6', icon: 'CreditCard' },
    { id: 'acc_nupj', name: 'NuPj', type: 'bank', balance: 4972.61, currency: 'BRL', color: '#8B5CF6', icon: 'Briefcase' },
    { id: 'acc_bity', name: 'Bity', type: 'investment', balance: 4669.00, currency: 'BRL', color: '#F59E0B', icon: 'Bitcoin' },
    { id: 'acc_clear', name: 'Clear', type: 'investment', balance: 13601.10, currency: 'BRL', color: '#10B981', icon: 'TrendingUp' },
    { id: 'acc_cmcapital', name: 'CM Capital', type: 'investment', balance: 1600.00, currency: 'BRL', color: '#64748B', icon: 'Building' },
    { id: 'acc_nubank', name: 'NuBank', type: 'bank', balance: 6.73, currency: 'BRL', color: '#A855F7', icon: 'CreditCard' }
];

// Re-using the logic from ExcelService to keep it simple, but doing it in a structured way
export const getFgoaTransactions = (rawCsv: string): any[] => {
    const lines = rawCsv.trim().split(/\r?\n/).slice(1);
    const transactions = lines.map((line, index) => {
        let inQuotes = false;
        let currentField = '';
        const fields = [];

        for (let c of line) {
            if (c === '"') {
                inQuotes = !inQuotes;
            } else if (c === ',' && !inQuotes) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += c;
            }
        }
        fields.push(currentField);

        const [account, amountStr, currency, title, dateStr, isIncomeStr, category] = fields;

        if (!amountStr) return null;

        const amount = Math.abs(parseFloat(amountStr));
        const date = new Date(dateStr).toISOString();
        const isIncome = isIncomeStr === 'True';

        return {
            id: `imported_${Date.now()}_${index}`,
            accountLabel: account,
            type: isIncome ? 'income' : 'expense',
            amount: isNaN(amount) ? 0 : amount,
            currency: currency || 'BRL',
            description: title || 'Sem título',
            categoryLabel: category || 'Outros',
            date: date,
            isRecurring: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }).filter(t => t !== null);

    return transactions;
};

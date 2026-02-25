import type { AppState, RecurringRule, Transaction } from '@/types';
import { transactionService, recurringService } from './storage';

export const recurringProcessor = {
    processDueRules: (state: AppState): AppState => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates without time

        // deep copy state to avoid mutation issues during iteration
        let currentState = { ...state };
        let hasChanges = false;

        const activeRules = currentState.recurringRules.filter(r => r.active);

        for (const rule of activeRules) {
            const nextDate = new Date(rule.nextDate);
            nextDate.setHours(0, 0, 0, 0);

            if (nextDate <= today) {
                // Rule is due!
                hasChanges = true;

                // 1. Create Transaction
                const newTransaction = {
                    amount: rule.amount,
                    type: rule.type,
                    currency: currentState.settings.defaultCurrency, // Or safe fallback
                    description: rule.description,
                    categoryId: rule.categoryId,
                    accountId: rule.accountId,
                    date: nextDate.toISOString(),
                    isRecurring: true,
                    recurringRuleId: rule.id,
                };

                // We use the service but we need to pass the *latest* state
                // This is a bit tricky with immutable state in a loop.
                // We can accumulate transactions and rule updates, then apply them.
                // Or just chain the state updates. Chaining is safer for consistency.

                // Add transaction
                // We need to fetch currency from account if possible, or use rule if we stored it (we didn't store currency in rule, assuming account currency or default)
                // Actually, transactions need a currency. Let's look up the account.
                const account = currentState.accounts.find(a => a.id === rule.accountId);
                const currency = account?.currency || 'BRL';

                currentState = transactionService.create(currentState, {
                    ...newTransaction,
                    currency
                });

                // 2. Update Rule (Next Date)
                const newNextDate = calculateNextDate(rule.nextDate, rule.frequency);

                currentState = recurringService.update(currentState, rule.id, {
                    lastGenerated: new Date().toISOString(),
                    nextDate: newNextDate
                });
            }
        }

        return currentState;
    }
};

function calculateNextDate(currentDateStr: string, frequency: string): string {
    const date = new Date(currentDateStr);

    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date.toISOString();
}

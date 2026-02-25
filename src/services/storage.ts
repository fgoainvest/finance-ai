import type { AppState, Transaction, Account, Category, UserSettings, ChatMessage, RecurringRule } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from '@/data/defaults';

const STORAGE_KEY = 'financeiro_ai_data';

/**
 * Get initial app state with defaults
 */
function getInitialState(): AppState {
    return {
        transactions: [],
        accounts: DEFAULT_ACCOUNTS,
        categories: DEFAULT_CATEGORIES,
        budgets: [],
        recurringRules: [],
        settings: {
            defaultCurrency: 'BRL',
            theme: 'system',
            language: 'pt-BR',
        },
        chatHistory: [],
    };
}

/**
 * Load state from localStorage
 */
export function loadState(): AppState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const initial = getInitialState();
            saveState(initial);
            return initial;
        }

        const parsed = JSON.parse(stored) as AppState;

        // Merge with defaults to handle new fields
        return {
            ...getInitialState(),
            ...parsed,
            // Ensure default categories exist
            categories: mergeCategories(parsed.categories || [], DEFAULT_CATEGORIES),
            // Ensure default accounts exist
            accounts: mergeAccounts(parsed.accounts || [], DEFAULT_ACCOUNTS),
        };
    } catch (error) {
        console.error('Failed to load state:', error);
        return getInitialState();
    }
}

/**
 * Save state to localStorage
 */
export function saveState(state: AppState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save state:', error);
    }
}

/**
 * Merge user categories with default categories
 */
function mergeCategories(userCategories: Category[], defaults: Category[]): Category[] {
    const userIds = new Set(userCategories.map(c => c.id));
    const missingDefaults = defaults.filter(d => !userIds.has(d.id));
    return [...userCategories, ...missingDefaults];
}

/**
 * Merge user accounts with default accounts
 */
function mergeAccounts(userAccounts: Account[], defaults: Account[]): Account[] {
    const userIds = new Set(userAccounts.map(a => a.id));
    const missingDefaults = defaults.filter(d => !userIds.has(d.id));
    return [...userAccounts, ...missingDefaults];
}


// ===== Transaction Operations =====
export const transactionService = {
    getAll: (state: AppState): Transaction[] => state.transactions,

    getById: (state: AppState, id: string): Transaction | undefined =>
        state.transactions.find(t => t.id === id),

    create: (state: AppState, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): AppState => {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        };

        // Update account balance
        const updatedAccounts = state.accounts.map(acc => {
            if (acc.id === transaction.accountId) {
                const balanceChange = transaction.type === 'income'
                    ? transaction.amount
                    : -transaction.amount;
                return { ...acc, balance: acc.balance + balanceChange };
            }
            return acc;
        });

        return {
            ...state,
            transactions: [newTransaction, ...state.transactions],
            accounts: updatedAccounts,
        };
    },

    update: (state: AppState, id: string, updates: Partial<Transaction>): AppState => {
        const oldTransaction = state.transactions.find(t => t.id === id);
        if (!oldTransaction) return state;

        const updatedTransaction = { ...oldTransaction, ...updates, updatedAt: new Date().toISOString() };

        // If amount, type, or accountId changed, we need to update account balances
        let updatedAccounts = state.accounts;
        const amountChanged = updates.amount !== undefined && updates.amount !== oldTransaction.amount;
        const typeChanged = updates.type !== undefined && updates.type !== oldTransaction.type;
        const accountChanged = updates.accountId !== undefined && updates.accountId !== oldTransaction.accountId;

        if (amountChanged || typeChanged || accountChanged) {
            // Revert old transaction's impact
            updatedAccounts = updatedAccounts.map(acc => {
                if (acc.id === oldTransaction.accountId) {
                    const balanceRevert = oldTransaction.type === 'income'
                        ? -oldTransaction.amount
                        : oldTransaction.amount;
                    return { ...acc, balance: acc.balance + balanceRevert };
                }
                return acc;
            });

            // Apply new transaction's impact
            updatedAccounts = updatedAccounts.map(acc => {
                const targetAccountId = updates.accountId || oldTransaction.accountId;
                if (acc.id === targetAccountId) {
                    const finalType = updates.type || oldTransaction.type;
                    const finalAmount = updates.amount !== undefined ? updates.amount : oldTransaction.amount;
                    const balanceChange = finalType === 'income'
                        ? finalAmount
                        : -finalAmount;
                    return { ...acc, balance: acc.balance + balanceChange };
                }
                return acc;
            });
        }

        return {
            ...state,
            transactions: state.transactions.map(t => t.id === id ? updatedTransaction : t),
            accounts: updatedAccounts,
        };
    },

    delete: (state: AppState, id: string): AppState => {
        const transaction = state.transactions.find(t => t.id === id);
        if (!transaction) return state;

        // Revert account balance
        const updatedAccounts = state.accounts.map(acc => {
            if (acc.id === transaction.accountId) {
                const balanceRevert = transaction.type === 'income'
                    ? -transaction.amount
                    : transaction.amount;
                return { ...acc, balance: acc.balance + balanceRevert };
            }
            return acc;
        });

        return {
            ...state,
            transactions: state.transactions.filter(t => t.id !== id),
            accounts: updatedAccounts,
        };
    },

    getByDateRange: (state: AppState, startDate: string, endDate: string): Transaction[] => {
        return state.transactions.filter(t => t.date >= startDate && t.date <= endDate);
    },

    getByCategory: (state: AppState, categoryId: string): Transaction[] => {
        return state.transactions.filter(t => t.categoryId === categoryId);
    },

    getByAccount: (state: AppState, accountId: string): Transaction[] => {
        return state.transactions.filter(t => t.accountId === accountId);
    },
};

// ===== Account Operations =====
export const accountService = {
    getAll: (state: AppState): Account[] => state.accounts,

    getById: (state: AppState, id: string): Account | undefined =>
        state.accounts.find(a => a.id === id),

    create: (state: AppState, account: Omit<Account, 'id'>): AppState => ({
        ...state,
        accounts: [...state.accounts, { ...account, id: crypto.randomUUID() }],
    }),

    update: (state: AppState, id: string, updates: Partial<Account>): AppState => ({
        ...state,
        accounts: state.accounts.map(a => a.id === id ? { ...a, ...updates } : a),
    }),

    delete: (state: AppState, id: string): AppState => ({
        ...state,
        accounts: state.accounts.filter(a => a.id !== id),
    }),

    getTotalBalance: (state: AppState): number =>
        state.accounts.reduce((sum, acc) => sum + acc.balance, 0),
};

// ===== Category Operations =====
export const categoryService = {
    getAll: (state: AppState): Category[] => state.categories,

    getById: (state: AppState, id: string): Category | undefined =>
        state.categories.find(c => c.id === id),

    getByType: (state: AppState, type: 'income' | 'expense'): Category[] =>
        state.categories.filter(c => c.type === type),

    create: (state: AppState, category: Omit<Category, 'id' | 'isDefault'>): AppState => ({
        ...state,
        categories: [...state.categories, { ...category, id: crypto.randomUUID(), isDefault: false }],
    }),

    update: (state: AppState, id: string, updates: Partial<Category>): AppState => ({
        ...state,
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
    }),

    delete: (state: AppState, id: string): AppState => ({
        ...state,
        categories: state.categories.filter(c => c.id !== id || c.isDefault),
    }),
};

// ===== Settings Operations =====
export const settingsService = {
    get: (state: AppState): UserSettings => state.settings,

    update: (state: AppState, updates: Partial<UserSettings>): AppState => ({
        ...state,
        settings: { ...state.settings, ...updates },
    }),
};

// ===== Chat Operations =====
export const chatService = {
    getHistory: (state: AppState): ChatMessage[] => state.chatHistory,

    addMessage: (state: AppState, message: Omit<ChatMessage, 'id' | 'timestamp'>): AppState => ({
        ...state,
        chatHistory: [
            ...state.chatHistory,
            {
                ...message,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
            },
        ],
    }),

    clearHistory: (state: AppState): AppState => ({
        ...state,
        chatHistory: [],
    }),
};

// ===== Recurring Rules Operations =====
export const recurringService = {
    getAll: (state: AppState): RecurringRule[] => state.recurringRules,

    getById: (state: AppState, id: string): RecurringRule | undefined =>
        state.recurringRules.find(r => r.id === id),

    create: (state: AppState, rule: Omit<RecurringRule, 'id' | 'createdAt' | 'lastGenerated'>): AppState => {
        const now = new Date().toISOString();
        const newRule: RecurringRule = {
            ...rule,
            id: crypto.randomUUID(),
            createdAt: now,
            lastGenerated: undefined,
        };

        return {
            ...state,
            recurringRules: [...state.recurringRules, newRule],
        };
    },

    update: (state: AppState, id: string, updates: Partial<RecurringRule>): AppState => ({
        ...state,
        recurringRules: state.recurringRules.map(r => r.id === id ? { ...r, ...updates } : r),
    }),

    delete: (state: AppState, id: string): AppState => ({
        ...state,
        recurringRules: state.recurringRules.filter(r => r.id !== id),
    }),
};

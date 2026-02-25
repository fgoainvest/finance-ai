// ===== Currency Types =====
export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP';

// ===== Transaction Types =====
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: CurrencyCode;
    description: string;
    categoryId: string;
    date: string; // ISO string
    notes?: string;
    aiCategorySuggestion?: string;
    isRecurring: boolean;
    recurringRuleId?: string;
    createdAt: string;
    updatedAt: string;
}

// ===== Account Types =====
export type AccountType = 'bank' | 'cash' | 'credit' | 'investment';

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: CurrencyCode;
    color: string;
    icon: string;
}

// ===== Category Types =====
export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    isDefault: boolean;
}

// ===== Recurring Rule Types =====
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
    id: string;
    frequency: RecurringFrequency;
    startDate: string;
    nextDate: string;
    lastGenerated?: string;
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
    type: TransactionType;
    active: boolean;
    createdAt: string;
}

// ===== Budget Types =====
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
    id: string;
    categoryId: string;
    amount: number;
    currency: CurrencyCode;
    period: BudgetPeriod;
    startDate: string;
    spent: number;
}

// ===== User Settings =====
export interface UserSettings {
    defaultCurrency: CurrencyCode;
    theme: 'light' | 'dark' | 'system';
    language: 'pt-BR' | 'en-US';
}

// ===== AI Types =====
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    image?: string; // Base64 or URL
}

export interface CategorySuggestion {
    categoryId: string;
    categoryName: string;
    confidence: number;
}

// ===== App State =====
export interface AppState {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    budgets: Budget[];
    recurringRules: RecurringRule[];
    settings: UserSettings;
    chatHistory: ChatMessage[];
}

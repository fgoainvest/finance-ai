import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Transaction, Account, Category, UserSettings, ChatMessage, RecurringRule } from '@/types';
import { loadState, saveState, transactionService, accountService, categoryService, settingsService, chatService, recurringService } from '@/services/storage';
import { recurringProcessor } from '@/services/recurring';

// ===== Actions =====
type Action =
    | { type: 'LOAD_STATE'; payload: AppState }
    | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> }
    | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
    | { type: 'DELETE_TRANSACTION'; payload: string }
    | { type: 'ADD_ACCOUNT'; payload: Omit<Account, 'id'> }
    | { type: 'UPDATE_ACCOUNT'; payload: { id: string; updates: Partial<Account> } }
    | { type: 'DELETE_ACCOUNT'; payload: string }
    | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id' | 'isDefault'> }
    | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
    | { type: 'DELETE_CATEGORY'; payload: string }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
    | { type: 'ADD_CHAT_MESSAGE'; payload: Omit<ChatMessage, 'id' | 'timestamp'> }
    | { type: 'CLEAR_CHAT' }
    | { type: 'ADD_RECURRING_RULE'; payload: Omit<RecurringRule, 'id' | 'createdAt' | 'lastGenerated'> }
    | { type: 'UPDATE_RECURRING_RULE'; payload: { id: string; updates: Partial<RecurringRule> } }
    | { type: 'DELETE_RECURRING_RULE'; payload: string }
    | { type: 'CHECK_RECURRING_RULES' };

// ===== Reducer =====
function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'LOAD_STATE':
            return action.payload;
        case 'ADD_TRANSACTION':
            return transactionService.create(state, action.payload);
        case 'UPDATE_TRANSACTION':
            return transactionService.update(state, action.payload.id, action.payload.updates);
        case 'DELETE_TRANSACTION':
            return transactionService.delete(state, action.payload);
        case 'ADD_ACCOUNT':
            return accountService.create(state, action.payload);
        case 'UPDATE_ACCOUNT':
            return accountService.update(state, action.payload.id, action.payload.updates);
        case 'DELETE_ACCOUNT':
            return accountService.delete(state, action.payload);
        case 'ADD_CATEGORY':
            return categoryService.create(state, action.payload);
        case 'UPDATE_CATEGORY':
            return categoryService.update(state, action.payload.id, action.payload.updates);
        case 'DELETE_CATEGORY':
            return categoryService.delete(state, action.payload);
        case 'UPDATE_SETTINGS':
            return settingsService.update(state, action.payload);
        case 'ADD_CHAT_MESSAGE':
            return chatService.addMessage(state, action.payload);
        case 'CLEAR_CHAT':
            return chatService.clearHistory(state);
        case 'ADD_RECURRING_RULE':
            return recurringService.create(state, action.payload);
        case 'UPDATE_RECURRING_RULE':
            return recurringService.update(state, action.payload.id, action.payload.updates);
        case 'DELETE_RECURRING_RULE':
            return recurringService.delete(state, action.payload);
        case 'CHECK_RECURRING_RULES':
            return recurringProcessor.processDueRules(state);
        default:
            return state;
    }
}

// ===== Context =====
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    // Computed values
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    prevMonthlyIncome: number;
    prevMonthlyExpenses: number;
    // Helper functions
    getCategoryById: (id: string) => Category | undefined;
    getAccountById: (id: string) => Account | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

// ===== Provider =====
interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const [state, dispatch] = useReducer(appReducer, null, () => loadState());

    // Check for recurring transactions on mount
    useEffect(() => {
        dispatch({ type: 'CHECK_RECURRING_RULES' });
    }, []);

    // Save state on changes
    useEffect(() => {
        saveState(state);
    }, [state]);

    // Computed values
    const totalBalance = useMemo(() => accountService.getTotalBalance(state), [state]);

    const { monthlyIncome, monthlyExpenses, prevMonthlyIncome, prevMonthlyExpenses } = useMemo(() => {
        const now = new Date();

        // Current month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        const monthTransactions = transactionService.getByDateRange(state, monthStart, monthEnd);

        // Previous month
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
        const prevMonthTransactions = transactionService.getByDateRange(state, prevMonthStart, prevMonthEnd);

        const calculateTotals = (transactions: Transaction[]) => {
            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            return { income, expenses };
        };

        const current = calculateTotals(monthTransactions);
        const previous = calculateTotals(prevMonthTransactions);

        return {
            monthlyIncome: current.income,
            monthlyExpenses: current.expenses,
            prevMonthlyIncome: previous.income,
            prevMonthlyExpenses: previous.expenses
        };
    }, [state]);

    // Helper functions
    const getCategoryById = useCallback(
        (id: string) => categoryService.getById(state, id),
        [state]
    );

    const getAccountById = useCallback(
        (id: string) => accountService.getById(state, id),
        [state]
    );

    return (
        <AppContext.Provider
            value={{
                state,
                dispatch,
                totalBalance,
                monthlyIncome,
                monthlyExpenses,
                prevMonthlyIncome,
                prevMonthlyExpenses,
                getCategoryById,
                getAccountById,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

// ===== Hook =====
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

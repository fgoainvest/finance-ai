import { supabase } from '@/lib/supabase';
import type { Transaction, Account, Category } from '@/types';

export const supabaseService = {
    // Authentication
    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    },

    async signOut() {
        return await supabase.auth.signOut();
    },

    async getSession() {
        return await supabase.auth.getSession();
    },

    // Transactions
    async getTransactions() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
        return { data, error };
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select();
        return { data, error };
    },

    async createTransactionsBatch(transactions: any[]) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transactions)
            .select();
        return { data, error };
    },

    // Accounts
    async getAccounts() {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('name');
        return { data, error };
    },

    async createAccount(account: any) {
        const { data, error } = await supabase
            .from('accounts')
            .insert([account])
            .select();
        return { data, error };
    },

    async updateAccountBalance(accountId: string, newBalance: number) {
        const { data, error } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', accountId);
        return { data, error };
    },

    // Categories
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        return { data, error };
    },

    async createCategory(category: any) {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select();
        return { data, error };
    }
};

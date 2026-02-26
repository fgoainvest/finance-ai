import { supabaseService } from './supabaseService';
import type { AppState, Category, Account, Transaction } from '@/types';

export const syncService = {
    /**
     * Uploads the entire local state to Supabase for the current user.
     * This handles mapping local IDs to database IDs if necessary, 
     * although it's better to preserve IDs if we can (using UUIDs).
     */
    async uploadAllData(state: AppState, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            // 1. Get existing data to avoid duplicates (basic check)
            const { data: existingCats } = await supabaseService.getCategories();
            const { data: existingAccs } = await supabaseService.getAccounts();

            const existingCatNames = new Set(existingCats?.map(c => c.name.toLowerCase()) || []);
            const existingAccNames = new Set(existingAccs?.map(a => a.name.toLowerCase()) || []);

            // 2. Sync Categories
            const catMap = new Map<string, string>(); // Local ID -> Supabase ID

            // First, link existing categories
            state.categories.forEach(localCat => {
                const found = existingCats?.find(c => c.name.toLowerCase() === localCat.name.toLowerCase());
                if (found) {
                    catMap.set(localCat.id, found.id);
                }
            });

            // Create missing categories
            for (const localCat of state.categories) {
                if (!catMap.has(localCat.id)) {
                    const { data, error } = await supabaseService.createCategory({
                        user_id: userId,
                        name: localCat.name,
                        icon: localCat.icon,
                        color: localCat.color,
                        type: localCat.type,
                        is_default: localCat.isDefault
                    });

                    if (error) {
                        console.error('Error creating category:', localCat.name, error);
                        continue;
                    }
                    if (data && data[0]) {
                        catMap.set(localCat.id, data[0].id);
                    }
                }
            }

            // 3. Sync Accounts
            const accMap = new Map<string, string>(); // Local ID -> Supabase ID

            // First, link existing accounts
            state.accounts.forEach(localAcc => {
                const found = existingAccs?.find(a => a.name.toLowerCase() === localAcc.name.toLowerCase());
                if (found) {
                    accMap.set(localAcc.id, found.id);
                }
            });

            // Create missing accounts
            for (const localAcc of state.accounts) {
                if (!accMap.has(localAcc.id)) {
                    const { data, error } = await supabaseService.createAccount({
                        user_id: userId,
                        name: localAcc.name,
                        type: localAcc.type,
                        balance: localAcc.balance,
                        currency: localAcc.currency,
                        color: localAcc.color,
                        icon: localAcc.icon
                    });

                    if (error) {
                        console.error('Error creating account:', localAcc.name, error);
                        continue;
                    }
                    if (data && data[0]) {
                        accMap.set(localAcc.id, data[0].id);
                    }
                }
            }

            // 4. Transform and Sync Transactions
            const dbTransactions = state.transactions.map(t => ({
                user_id: userId,
                account_id: accMap.get(t.accountId) || t.accountId,
                category_id: catMap.get(t.categoryId) || t.categoryId,
                type: t.type,
                amount: t.amount,
                currency: t.currency,
                description: t.description,
                date: t.date,
                notes: t.notes,
                is_recurring: t.isRecurring,
                created_at: t.createdAt,
                updated_at: t.updatedAt
            })).filter(t => t.account_id && t.category_id); // Ensure we have valid relations

            if (dbTransactions.length > 0) {
                // Batch insert (Supabase handles this well)
                const { error } = await supabaseService.createTransactionsBatch(dbTransactions);
                if (error) throw error;
            }

            return {
                success: true,
                message: `Sucesso! Sincronizado ${state.categories.length} categorias, ${state.accounts.length} contas e ${state.transactions.length} transações.`
            };
        } catch (error: any) {
            console.error('Sync failed:', error);
            return { success: false, message: error.message || 'Erro desconhecido na sincronização.' };
        }
    }
};

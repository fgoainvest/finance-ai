import type { Category, Account } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
    // Income categories
    { id: 'cat_salary', name: 'Salário', icon: 'Banknote', color: '#10B981', type: 'income', isDefault: true },
    { id: 'cat_freelance', name: 'Freelance', icon: 'Laptop', color: '#14B8A6', type: 'income', isDefault: true },
    { id: 'cat_investments', name: 'Investimentos', icon: 'TrendingUp', color: '#22C55E', type: 'income', isDefault: true },
    { id: 'cat_gifts_in', name: 'Presentes', icon: 'Gift', color: '#84CC16', type: 'income', isDefault: true },
    { id: 'cat_refunds', name: 'Reembolsos', icon: 'RotateCcw', color: '#06B6D4', type: 'income', isDefault: true },
    { id: 'cat_other_income', name: 'Outros', icon: 'Plus', color: '#8B5CF6', type: 'income', isDefault: true },

    // Expense categories
    { id: 'cat_food', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#F97316', type: 'expense', isDefault: true },
    { id: 'cat_transport', name: 'Transporte', icon: 'Car', color: '#3B82F6', type: 'expense', isDefault: true },
    { id: 'cat_housing', name: 'Moradia', icon: 'Home', color: '#8B5CF6', type: 'expense', isDefault: true },
    { id: 'cat_utilities', name: 'Contas', icon: 'Zap', color: '#FBBF24', type: 'expense', isDefault: true },
    { id: 'cat_health', name: 'Saúde', icon: 'Heart', color: '#EF4444', type: 'expense', isDefault: true },
    { id: 'cat_education', name: 'Educação', icon: 'GraduationCap', color: '#6366F1', type: 'expense', isDefault: true },
    { id: 'cat_entertainment', name: 'Lazer', icon: 'Gamepad2', color: '#EC4899', type: 'expense', isDefault: true },
    { id: 'cat_shopping', name: 'Compras', icon: 'ShoppingBag', color: '#F472B6', type: 'expense', isDefault: true },
    { id: 'cat_travel', name: 'Viagens', icon: 'Plane', color: '#0EA5E9', type: 'expense', isDefault: true },
    { id: 'cat_subscriptions', name: 'Assinaturas', icon: 'CreditCard', color: '#A855F7', type: 'expense', isDefault: true },
    { id: 'cat_pets', name: 'Pets', icon: 'PawPrint', color: '#F59E0B', type: 'expense', isDefault: true },
    { id: 'cat_gifts_out', name: 'Presentes', icon: 'Gift', color: '#FB7185', type: 'expense', isDefault: true },
    { id: 'cat_other_expense', name: 'Outros', icon: 'MoreHorizontal', color: '#94A3B8', type: 'expense', isDefault: true },
];

export const DEFAULT_ACCOUNTS: Account[] = [];

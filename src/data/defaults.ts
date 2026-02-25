import type { Category } from '@/types';

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

export const DEFAULT_ACCOUNTS = [
    { id: 'acc_picpay', name: 'Picpay', type: 'bank' as const, balance: 3937.61, currency: 'BRL' as const, color: '#21C25E', icon: 'Building2' },
    { id: 'acc_99pay', name: '99Pay', type: 'bank' as const, balance: 2273.92, currency: 'BRL' as const, color: '#F5A623', icon: 'Wallet' },
    { id: 'acc_mercadopago', name: 'Mercado Pago', type: 'bank' as const, balance: -1648.82, currency: 'BRL' as const, color: '#009EE3', icon: 'Building2' },
    { id: 'acc_nupj', name: 'NuPj', type: 'bank' as const, balance: 4972.61, currency: 'BRL' as const, color: '#8A05BE', icon: 'Building2' },
    { id: 'acc_bity', name: 'Bity', type: 'bank' as const, balance: 4669.00, currency: 'BRL' as const, color: '#F59E0B', icon: 'Building2' },
    { id: 'acc_clear', name: 'Clear', type: 'investment' as const, balance: 13601.10, currency: 'BRL' as const, color: '#06B6D4', icon: 'TrendingUp' },
    { id: 'acc_cmcapital', name: 'CM Capital', type: 'investment' as const, balance: 1600.00, currency: 'BRL' as const, color: '#6366F1', icon: 'TrendingUp' },
    { id: 'acc_nubank', name: 'NuBank', type: 'bank' as const, balance: 6.73, currency: 'BRL' as const, color: '#9B59B6', icon: 'CreditCard' },
];

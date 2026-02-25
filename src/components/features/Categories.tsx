import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, Button, Modal, Input, ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#64748b', // slate
    '#f97316', // orange
];

export function Categories() {
    const { state, dispatch } = useApp();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        type: 'expense',
        color: colors[0],
        icon: 'tag',
        isDefault: false
    });

    const filteredCategories = state.categories.filter(c => c.type === activeTab);

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData(category);
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                type: activeTab,
                color: colors[0],
                icon: 'tag',
                isDefault: false
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) return;

        if (editingCategory) {
            dispatch({
                type: 'UPDATE_CATEGORY',
                payload: {
                    id: editingCategory.id,
                    updates: formData,
                },
            });
            showToast('Categoria atualizada com sucesso', 'success');
        } else {
            dispatch({
                type: 'ADD_CATEGORY',
                payload: formData as Omit<Category, 'id' | 'isDefault'>,
            });
            showToast('Categoria criada com sucesso', 'success');
        }

        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch({ type: 'DELETE_CATEGORY', payload: deleteId });
            showToast('Categoria excluída com sucesso', 'success');
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-display font-bold text-[rgb(var(--text-primary))]">
                    Categorias
                </h2>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-[rgba(var(--bg-secondary),0.5)] backdrop-blur-md rounded-2xl border border-[rgba(var(--border-primary),0.3)] w-fit shadow-inner">
                <button
                    onClick={() => setActiveTab('expense')}
                    className={cn(
                        "px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300",
                        activeTab === 'expense'
                            ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg"
                            : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-white/5"
                    )}
                >
                    Despesas
                </button>
                <button
                    onClick={() => setActiveTab('income')}
                    className={cn(
                        "px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ml-1",
                        activeTab === 'income'
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                            : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-white/5"
                    )}
                >
                    Receitas
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                    <Card
                        key={category.id}
                        variant="glass"
                        className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.03] flex items-center p-5 border-[rgba(var(--border-primary),0.3)] shadow-lg"
                    >
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shrink-0 transition-transform group-hover:rotate-12 duration-500"
                            style={{
                                backgroundColor: `${category.color}15`,
                                border: `1px solid ${category.color}30`,
                                boxShadow: `inset 0 0 10px ${category.color}10`
                            }}
                        >
                            <Tag className="h-6 w-6" style={{ color: category.color, filter: `drop-shadow(0 0 5px ${category.color}40)` }} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-[rgb(var(--text-primary))] truncate tracking-tight">
                                {category.name}
                            </h3>
                            {category.isDefault ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Sistema</span>
                            ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--text-muted))]">Personalizada</span>
                            )}
                        </div>

                        {!category.isDefault && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(category);
                                    }}
                                >
                                    <Pencil className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg hover:text-red-500 hover:bg-red-500/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(category.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                            Nome
                        </label>
                        <Input
                            placeholder="Ex: Alimentação, Lazer..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                            Tipo
                        </label>
                        <select
                            className="w-full h-10 px-3 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))]"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                            disabled={!!editingCategory} // Don't allow changing type after creation for simplicity
                        >
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                            Cor
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                                        formData.color === color ? "ring-2 ring-[rgb(var(--text-primary))]" : ""
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                        </Button>
                    </div>
                </form>
            </Modal>
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Excluir Categoria"
                message="Tem certeza que deseja excluir esta categoria? Transações existentes com esta categoria não serão excluídas, mas ficarão sem categoria associada."
                confirmLabel="Excluir"
                variant="danger"
            />
        </div>
    );
}

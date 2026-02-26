import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Dashboard, TransactionsList, TransactionForm, Accounts, Categories, AIChatDrawer, RecurringRules, Settings, Auth } from '@/components/features';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction } from '@/types';
import { Loader2 } from 'lucide-react';

type Page = 'dashboard' | 'transactions' | 'categories' | 'accounts' | 'settings' | 'recurring';

const pageTitles: Record<Page, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral das suas finanças' },
  transactions: { title: 'Transações', subtitle: 'Gerencie suas receitas e despesas' },
  categories: { title: 'Categorias', subtitle: 'Gerencie categorias de receitas e despesas' },
  accounts: { title: 'Contas', subtitle: 'Gerencie suas contas e saldos' },
  recurring: { title: 'Recorrência', subtitle: 'Contas fixas e assinaturas' },
  settings: { title: 'Configurações', subtitle: 'Personalize sua experiência' },
};

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const pageInfo = pageTitles[currentPage];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onViewTransactions={() => setCurrentPage('transactions')}
            onAddTransaction={handleAddClick}
          />
        );
      case 'transactions':
        return (
          <TransactionsList
            onEdit={handleEdit}
            onAdd={handleAddClick}
          />
        );
      case 'categories':
        return <Categories />;
      case 'accounts':
        return <Accounts />;
      case 'recurring':
        return <RecurringRules />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAddClick={handleAddClick}
        pageTitle={pageInfo.title}
        pageSubtitle={pageInfo.subtitle}
      >
        {renderPage()}
      </Layout>

      <TransactionForm
        isOpen={isTransactionModalOpen}
        onClose={handleCloseModal}
        editTransaction={editingTransaction ? {
          id: editingTransaction.id,
          type: editingTransaction.type,
          amount: editingTransaction.amount,
          currency: editingTransaction.currency,
          description: editingTransaction.description,
          categoryId: editingTransaction.categoryId,
          accountId: editingTransaction.accountId,
          date: editingTransaction.date,
          notes: editingTransaction.notes,
          isRecurring: editingTransaction.isRecurring,
        } : undefined}
      />
      <AIChatDrawer />
    </>
  );
}

export default App;

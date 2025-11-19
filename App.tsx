import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, Goal, TransactionType } from './types';
import { getTransactions, saveTransactions, getGoals, saveGoals } from './services/localStorageService';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import GoalForm from './components/GoalForm';
import GoalList from './components/GoalList';
import ReportsPage from './components/ReportsPage';

type ActiveSection = 'dashboard' | 'transactions' | 'goals' | 'reports';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  
  // Lazy initialization ensures we load from LocalStorage BEFORE the initial render.
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions());
  const [goals, setGoals] = useState<Goal[]>(() => getGoals());
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  // --- Backup & Restore Features ---
  const handleExportData = () => {
    const data = {
      transactions,
      goals,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `backup_financas_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let loadedTransactions = 0;
        let loadedGoals = 0;

        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
          loadedTransactions = parsed.transactions.length;
        }
        if (parsed.goals && Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
          loadedGoals = parsed.goals.length;
        }
        
        alert(`Backup restaurado com sucesso!\n\n${loadedTransactions} transações carregadas.\n${loadedGoals} metas carregadas.`);
        setActiveSection('dashboard');
      } catch (err) {
        console.error(err);
        alert('Erro ao ler arquivo de backup. Verifique se é um arquivo .json válido.');
      }
      // Reset file input
      e.target.value = '';
    };
    reader.readAsText(file);
  };
  // --------------------------------

  // Goal handlers
  const handleAddOrUpdateGoal = useCallback((goal: Goal) => {
    setGoals((prevGoals) => {
      const existingIndex = prevGoals.findIndex((g) => g.id === goal.id);
      if (existingIndex > -1) {
        return prevGoals.map((g) => (g.id === goal.id ? goal : g));
      } else {
        return [...prevGoals, goal];
      }
    });
    setEditingGoal(null); 
    setActiveSection('goals'); // Return to list after save
  }, [setGoals]);

  // Transaction handlers with Goal sync logic
  const handleAddOrUpdateTransaction = useCallback((transaction: Transaction, linkedGoalId?: string, previousAmount?: number, previousGoalId?: string) => {
    // 1. Update Transaction List
    setTransactions((prevTransactions) => {
      const existingIndex = prevTransactions.findIndex((t) => t.id === transaction.id);
      if (existingIndex > -1) {
        return prevTransactions.map((t) => (t.id === transaction.id ? transaction : t));
      } else {
        return [...prevTransactions, transaction];
      }
    });

    // 2. Auto-Update Goal Logic
    if (transaction.type === TransactionType.INVESTMENT) {
      setGoals((prevGoals) => {
        return prevGoals.map((goal) => {
          let newCurrentAmount = goal.currentAmount;
          let changed = false;

          // Scenario 1: We are editing, and there was a goal previously linked.
          // We must remove the *old* amount from the *old* goal.
          if (previousGoalId && goal.id === previousGoalId) {
            if (previousAmount !== undefined) {
              newCurrentAmount -= previousAmount;
              changed = true;
            }
          }

          // Scenario 2: We have a target goal (new or same) to add the amount to.
          if (linkedGoalId && goal.id === linkedGoalId) {
            newCurrentAmount += transaction.amount;
            changed = true;
          }

          // Safety check for negative balances
          if (newCurrentAmount < 0) newCurrentAmount = 0;

          return changed ? { ...goal, currentAmount: newCurrentAmount } : goal;
        });
      });
    }

    setEditingTransaction(null); 
    setActiveSection('transactions'); // Return to list after save
  }, [setTransactions, setGoals]);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta transação?')) {
      setTransactions((prevTransactions) => prevTransactions.filter((t) => t.id !== id));
      setEditingTransaction(null);
    }
  }, [setTransactions]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveSection('transactions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setActiveSection]);

  const handleCancelEditTransaction = useCallback(() => {
    setEditingTransaction(null);
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta meta?')) {
      setGoals((prevGoals) => prevGoals.filter((g) => g.id !== id));
      setEditingGoal(null);
    }
  }, [setGoals]);

  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setActiveSection('goals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setActiveSection]);

  const handleCancelEditGoal = useCallback(() => {
    setEditingGoal(null);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard transactions={transactions} goals={goals} />;
      case 'transactions':
        return (
          <>
            <TransactionForm
              onSave={handleAddOrUpdateTransaction}
              onCancel={handleCancelEditTransaction}
              editingTransaction={editingTransaction}
              goals={goals} 
            />
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </>
        );
      case 'goals':
        return (
          <>
            <GoalForm
              onSave={handleAddOrUpdateGoal}
              onCancel={handleCancelEditGoal}
              editingGoal={editingGoal}
            />
            <GoalList
              goals={goals}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          </>
        );
      case 'reports':
        return <ReportsPage transactions={transactions} />;
      default:
        return <Dashboard transactions={transactions} goals={goals} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        onNavigate={setActiveSection} 
        activeSection={activeSection} 
        onExport={handleExportData}
        onImport={handleImportData}
      />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        {renderSection()}
      </main>
      <footer className="bg-gray-800 text-white p-6 text-center mt-8">
        <p>&copy; {new Date().getFullYear()} Controle Financeiro Pessoal. Dados salvos localmente no seu navegador.</p>
      </footer>
    </div>
  );
};

export default App;
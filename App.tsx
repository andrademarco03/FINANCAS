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
  
  // CRITICAL FIX: Lazy initialization ensures we load from LocalStorage BEFORE the initial render.
  // This prevents the 'save' effects from overwriting existing data with empty arrays on mount.
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions());
  const [goals, setGoals] = useState<Goal[]>(() => getGoals());
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Removed the useEffect that loaded data on mount, as it caused a race condition with the save effects.
  // Data is now loaded synchronously during state initialization.

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

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
      // Optional: Could also ask to revert money from linked goal here, but kept simple for now.
      setTransactions((prevTransactions) => prevTransactions.filter((t) => t.id !== id));
      setEditingTransaction(null);
    }
  }, [setTransactions]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveSection('transactions');
    // Scroll to top to ensure user sees the form
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
    // Scroll to top to ensure user sees the form
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
      <Header onNavigate={setActiveSection} activeSection={activeSection} />
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
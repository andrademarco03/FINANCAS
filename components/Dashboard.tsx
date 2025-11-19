import React, { useState } from 'react';
import { Transaction, Goal, Summary, TransactionType } from '../types';
import ExpenseChart from './ExpenseChart';
import MonthlyHistoryChart from './MonthlyHistoryChart';
import { getFinancialAdvice } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, goals }) => {
  // State to track the selected month for analysis
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // AI State
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  // Filter transactions for the SELECTED month summary and charts
  const currentMonthTransactions = transactions.filter(t => {
    // Safe date parsing
    const [yearStr, monthStr] = t.date.split('-');
    const tYear = parseInt(yearStr);
    const tMonth = parseInt(monthStr) - 1; // Month is 0-indexed
    
    return tMonth === currentMonth && tYear === currentYear;
  });

  const calculateSummary = (monthTrans: Transaction[]): Summary => {
    let totalIncome = 0;
    let totalFixedExpenses = 0;
    let totalVariableExpenses = 0;
    let totalInvestments = 0;

    monthTrans.forEach((t) => {
      if (t.type === TransactionType.INCOME) {
        totalIncome += t.amount;
      } else if (t.type === TransactionType.FIXED_EXPENSE) {
        totalFixedExpenses += t.amount;
      } else if (t.type === TransactionType.VARIABLE_EXPENSE) {
        totalVariableExpenses += t.amount;
      } else if (t.type === TransactionType.INVESTMENT) {
        totalInvestments += t.amount;
      }
    });

    // Net balance is: Income - (Fixed + Variable + Investments)
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const netBalance = totalIncome - totalExpenses - totalInvestments;

    return {
      totalIncome,
      totalFixedExpenses,
      totalVariableExpenses,
      totalInvestments,
      netBalance,
    };
  };

  const summary = calculateSummary(currentMonthTransactions);
  
  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
    setAiAdvice(''); // Reset advice when month changes
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
    setAiAdvice('');
  };

  const handleCurrentMonth = () => {
    setSelectedDate(new Date());
    setAiAdvice('');
  };

  const handleGenerateAiAdvice = async () => {
    setLoadingAi(true);
    try {
      const advice = await getFinancialAdvice(summary, currentMonthTransactions);
      setAiAdvice(advice || "Não foi possível gerar uma análise agora.");
    } catch (error) {
      setAiAdvice("Erro ao conectar com a IA. Verifique sua chave de API ou tente novamente.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center mb-8 space-y-4">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Dashboard
        </h2>
        
        {/* Month Navigation Controls */}
        <div className="flex items-center bg-white rounded-lg shadow p-1">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Mês Anterior"
          >
            ◀
          </button>
          <div className="px-6 py-2 text-lg font-bold text-blue-800 capitalize min-w-[200px] text-center border-x border-gray-100 mx-2">
            {monthName}
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Próximo Mês"
          >
            ▶
          </button>
        </div>
        
        <button 
          onClick={handleCurrentMonth}
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar para o mês atual
        </button>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              ✨ Consultor Financeiro IA
            </h3>
            <p className="text-purple-100 text-sm mt-1">
              Obtenha insights inteligentes sobre seus gastos deste mês com o Gemini.
            </p>
          </div>
          <button
            onClick={handleGenerateAiAdvice}
            disabled={loadingAi}
            className={`
              px-6 py-2 rounded-full font-semibold shadow-md transition-all
              ${loadingAi 
                ? 'bg-purple-400 cursor-not-allowed text-purple-100' 
                : 'bg-white text-purple-700 hover:bg-purple-50 hover:scale-105 active:scale-95'}
            `}
          >
            {loadingAi ? 'Analisando...' : 'Gerar Análise Inteligente'}
          </button>
        </div>
        
        {aiAdvice && (
          <div className="mt-6 bg-white/10 rounded-lg p-4 border border-white/20 animate-fade-in">
            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
              {/* Simple rendering of markdown-like output */}
              {aiAdvice.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-yellow-300">{part}</strong> : part
              )}
            </div>
          </div>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Receitas</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Despesas</h3>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">R$ {(summary.totalFixedExpenses + summary.totalVariableExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Investido</h3>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600">R$ {summary.totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow ${summary.netBalance >= 0 ? 'border-blue-500' : 'border-red-600'}`}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Balanço Líquido</h3>
          <p className={`text-2xl sm:text-3xl font-bold ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            R$ {summary.netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Entradas - Saídas</p>
        </div>
      </div>

      {/* Monthly Comparative Chart - Independent of selected month, shows history */}
      <div className="border-t pt-8">
        <MonthlyHistoryChart transactions={transactions} />
      </div>

      {/* Current Month Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            {/* Ensures ExpenseChart receives data filtered by the selected month */}
            <ExpenseChart transactions={currentMonthTransactions} />
         </div>
         <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 capitalize">Detalhes: {monthName}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Despesas Fixas</span>
                <span className="font-bold text-red-600">R$ {summary.totalFixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Despesas Variáveis</span>
                <span className="font-bold text-red-600">R$ {summary.totalVariableExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Investimentos</span>
                <span className="font-bold text-indigo-600">R$ {summary.totalInvestments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
               <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Entradas</span>
                <span className="font-bold text-green-600">R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Saídas</span>
                <span className="font-bold text-red-600">R$ {(summary.totalFixedExpenses + summary.totalVariableExpenses + summary.totalInvestments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
         </div>
      </div>

      {/* Financial Goals Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Minhas Metas (Progresso Geral)</h3>
        {goals.length === 0 ? (
          <p className="text-gray-600">Nenhuma meta definida. Vá em "Metas" para criar uma.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const progressBarWidth = Math.min(100, Math.max(0, progress)); 
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-gray-800">{goal.name}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isCompleted ? 'Concluída' : 'Em andamento'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                     <span>Atual: <strong>R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                     <span>Meta: <strong>R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 mt-1">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${progressBarWidth}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">{progressBarWidth.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
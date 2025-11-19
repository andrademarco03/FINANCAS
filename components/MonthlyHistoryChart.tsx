
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface MonthlyHistoryChartProps {
  transactions: Transaction[];
}

const MonthlyHistoryChart: React.FC<MonthlyHistoryChartProps> = ({ transactions }) => {
  // Generate last 6 months keys
  const getLast6Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`, // Key for grouping
        label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }), // Label for chart
        income: 0,
        expense: 0,
        investment: 0
      });
    }
    return months;
  };

  const data = getLast6Months();

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const key = `${tDate.getFullYear()}-${tDate.getMonth()}`;
    const monthData = data.find(m => m.key === key);
    
    if (monthData) {
      if (t.type === TransactionType.INCOME) {
        monthData.income += t.amount;
      } else if (t.type === TransactionType.INVESTMENT) {
        monthData.investment += t.amount;
      } else {
        monthData.expense += t.amount;
      }
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Comparativo Mensal (Últimos 6 Meses)</h2>
      <p className="text-gray-600 mb-6">Analise onde você precisa economizar comparando receitas e despesas.</p>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="income" name="Receitas" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="#F44336" radius={[4, 4, 0, 0]} />
          <Bar dataKey="investment" name="Investido" fill="#3F51B5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyHistoryChart;

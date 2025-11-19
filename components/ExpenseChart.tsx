
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction, TransactionType, TransactionCategory } from '../types';

interface ExpenseChartProps {
  transactions: Transaction[]; // Now expects already filtered transactions
}

const COLORS_CATEGORY = [
  '#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#00BCD4', '#FF9800', '#9C27B0', '#795548', '#607D8B', '#F44336'
];
const COLORS_TYPE = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  // Filter out income and investment transactions for expense charts
  const expenses = transactions.filter(
    (t) => t.type !== TransactionType.INCOME && t.type !== TransactionType.INVESTMENT
  );

  const dataByCategory = expenses.reduce((acc: { name: TransactionCategory; value: number }[], transaction) => {
    const existingCategory = acc.find((item) => item.name === transaction.category);
    if (existingCategory) {
      existingCategory.value += transaction.amount;
    } else {
      acc.push({ name: transaction.category, value: transaction.amount });
    }
    return acc;
  }, []);

  const dataByType = expenses.reduce((acc: { name: string; value: number }[], transaction) => {
    const typeLabel = transaction.type === TransactionType.FIXED_EXPENSE ? 'Despesa Fixa' : 'Despesa Variável';
    const existingType = acc.find((item) => item.name === typeLabel);
    if (existingType) {
      existingType.value += transaction.amount;
    } else {
      acc.push({ name: typeLabel, value: transaction.amount });
    }
    return acc;
  }, []);

  // Filter out categories/types with zero value for cleaner charts
  const filteredDataByCategory = dataByCategory.filter(data => data.value > 0);
  const filteredDataByType = dataByType.filter(data => data.value > 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise de Despesas</h2>
      {expenses.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Adicione despesas para ver os gráficos.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredDataByCategory.length > 0 && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Despesas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredDataByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {filteredDataByCategory.map((_entry, index) => (
                      <Cell key={`cell-category-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredDataByType.length > 0 && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Despesas por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredDataByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#82ca9d"
                    dataKey="value"
                    nameKey="name"
                  >
                    {filteredDataByType.map((_entry, index) => (
                      <Cell key={`cell-type-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredDataByCategory.length === 0 && filteredDataByType.length === 0 && expenses.length > 0 && (
            <p className="text-gray-600 text-center col-span-full">Nenhum dado de despesa para exibir nos gráficos.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;

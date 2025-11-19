import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import ExpenseChart from './ExpenseChart';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // This extends jsPDF with the autoTable method

interface ReportsPageProps {
  transactions: Transaction[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
  // FIX: Use local timezone date
  const today = new Date().toLocaleDateString('en-CA');
  
  // Get first day of current month in local time
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-CA');

  const [startDate, setStartDate] = useState<string>(firstDay);
  const [endDate, setEndDate] = useState<string>(today);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      // Create date objects from input strings (which are YYYY-MM-DD) treating them as local midnight
      // We can simply compare string values for YYYY-MM-DD if we are careful, but Date objects are safer
      // Use simple string comparison for date ranges to avoid timezone offset issues completely with YYYY-MM-DD
      return t.date >= startDate && t.date <= endDate;
    });
    setFilteredTransactions(filtered);
  }, [transactions, startDate, endDate]);

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return 'Receita';
      case TransactionType.FIXED_EXPENSE: return 'Despesa Fixa';
      case TransactionType.VARIABLE_EXPENSE: return 'Despesa Variável';
      case TransactionType.INVESTMENT: return 'Investimento/Poupança';
      default: return 'Desconhecido';
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${new Date(startDate + 'T00:00').toLocaleDateString('pt-BR')} a ${new Date(endDate + 'T00:00').toLocaleDateString('pt-BR')}`, 14, 30);

    const tableColumn = ["Data", "Descrição", "Tipo", "Categoria", "Valor"];
    const tableRows = filteredTransactions.map(t => [
      new Date(t.date + 'T00:00').toLocaleDateString('pt-BR'), // Force local time parsing
      t.description,
      getTransactionTypeLabel(t.type),
      t.category,
      `${t.type === TransactionType.INCOME ? '+' : '-'} R$ ${t.amount.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3, halign: 'left' },
      columnStyles: {
        4: { halign: 'right' } // Align amount to the right
      },
      headStyles: { fillColor: [60, 140, 250], textColor: [255, 255, 255] },
      margin: { top: 35 },
    });

    doc.save(`relatorio_financeiro_${startDate}_${endDate}.pdf`);
  };

  const handleExportCsv = () => {
    const headers = ["Data", "Descrição", "Tipo", "Categoria", "Valor"];
    const csvRows = filteredTransactions.map(t => {
      const amountPrefix = t.type === TransactionType.INCOME ? '+' : '-';
      return [
        new Date(t.date + 'T00:00').toLocaleDateString('pt-BR'),
        `"${t.description.replace(/"/g, '""')}"`, // Handle commas and quotes in description
        `"${getTransactionTypeLabel(t.type)}"`,
        `"${t.category}"`,
        `${amountPrefix} ${t.amount.toFixed(2).replace('.', ',')}` // Use comma for decimal for Excel compatibility
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_financeiro_${startDate}_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Relatórios Financeiros</h2>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              aria-label="Data de Início"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Fim
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              aria-label="Data de Fim"
            />
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button
              onClick={handleExportPdf}
              className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              aria-label="Exportar relatório para PDF"
            >
              Exportar PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
              aria-label="Exportar relatório para CSV (Excel)"
            >
              Exportar CSV (Excel)
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nenhuma transação encontrada para o período selecionado.</p>
        ) : (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Transações no Período</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date + 'T00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTransactionTypeLabel(transaction.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.category}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ExpenseChart now receives filtered transactions */}
      <ExpenseChart transactions={filteredTransactions} />
    </div>
  );
};

export default ReportsPage;
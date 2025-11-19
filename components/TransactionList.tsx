
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete }) => {
  const getAmountColorClass = (type: TransactionType) => {
    if (type === TransactionType.INCOME) {
      return 'text-green-600';
    } else if (type === TransactionType.INVESTMENT) {
      return 'text-indigo-600';
    }
    return 'text-red-600';
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return 'Receita';
      case TransactionType.FIXED_EXPENSE: return 'Despesa Fixa';
      case TransactionType.VARIABLE_EXPENSE: return 'Despesa Variável';
      case TransactionType.INVESTMENT: return 'Investimento/Poupança';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Transações</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhuma transação registrada ainda.</p>
      ) : (
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
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
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${getAmountColorClass(transaction.type)}`}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {transaction.documentUrl && (
                        <a
                          href={transaction.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150 ease-in-out"
                          aria-label={`Ver comprovante da transação ${transaction.description}`}
                        >
                          Ver Comprovante
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-150 ease-in-out"
                        aria-label={`Editar transação ${transaction.description}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                        aria-label={`Excluir transação ${transaction.description}`}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;

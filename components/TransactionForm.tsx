import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionCategory, Goal } from '../types';
import { TRANSACTION_TYPES_OPTIONS, TRANSACTION_CATEGORY_OPTIONS, TRANSACTION_CATEGORY_OPTIONS_FOR_INCOME } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import CurrencyInput from './CurrencyInput';
import { extractDataFromReceipt } from '../services/geminiService';

interface TransactionFormProps {
  onSave: (transaction: Transaction, linkedGoalId?: string, previousAmount?: number, previousGoalId?: string) => void;
  onCancel: () => void;
  editingTransaction?: Transaction | null;
  goals: Goal[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onCancel, editingTransaction, goals }) => {
  const today = new Date().toISOString().split('T')[0];
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(today);
  const [type, setType] = useState<TransactionType>(TransactionType.VARIABLE_EXPENSE);
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.UNCATEGORIZED);
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(undefined);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  
  // AI Loading State
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount);
      setDate(editingTransaction.date);
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDocumentUrl(editingTransaction.documentUrl);
      setSelectedGoalId(editingTransaction.goalId || '');
    } else {
      resetForm();
    }
  }, [editingTransaction]);

  useEffect(() => {
    // Reset category when type changes, to ensure consistency
    const validCategories = getCategoryOptions().map(opt => opt.value);
    
    if (!validCategories.includes(category)) {
      if (type === TransactionType.INCOME) {
        setCategory(TransactionCategory.INCOME_SOURCE);
      } else if (type === TransactionType.INVESTMENT) {
        setCategory(TransactionCategory.INVESTMENTS_SAVINGS);
      } else {
        setCategory(TransactionCategory.UNCATEGORIZED);
      }
    }
    // Reset goal selection if not investment
    if (type !== TransactionType.INVESTMENT) {
      setSelectedGoalId('');
    }
  }, [type]);

  const resetForm = () => {
    setDescription('');
    setAmount(0);
    setDate(today);
    setType(TransactionType.VARIABLE_EXPENSE);
    setCategory(TransactionCategory.UNCATEGORIZED);
    setDocumentUrl(undefined);
    setSelectedGoalId('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentUrl(reader.result as string); // Store as Data URL
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentUrl(undefined);
    }
  };

  // New AI Feature: Auto-fill from receipt
  const handleAutoFillFromImage = async () => {
    if (!documentUrl) return;
    
    setIsProcessingImage(true);
    try {
      // Detect mime type roughly from base64 header
      const mimeType = documentUrl.substring(documentUrl.indexOf(':') + 1, documentUrl.indexOf(';'));
      
      const extractedData = await extractDataFromReceipt(documentUrl, mimeType);
      
      if (extractedData) {
        if (extractedData.description) setDescription(extractedData.description);
        if (extractedData.amount) setAmount(extractedData.amount);
        if (extractedData.date) setDate(extractedData.date);
        
        // Try to match category enum loosely
        if (extractedData.category) {
           // Find matching enum value (exact or includes)
           const matchedCategory = Object.values(TransactionCategory).find(c => 
             c === extractedData.category || c.toLowerCase().includes(extractedData.category.toLowerCase())
           );
           if (matchedCategory) {
             setCategory(matchedCategory);
           }
        }
        alert('✨ Dados preenchidos pela IA com sucesso! Verifique se tudo está correto.');
      } else {
        alert('Não foi possível extrair dados claros da imagem. Tente uma foto mais nítida.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar imagem com IA. Verifique a conexão.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() === '' || amount <= 0) {
      alert('Por favor, preencha a descrição e um valor maior que zero.');
      return;
    }

    const newTransaction: Transaction = {
      id: editingTransaction ? editingTransaction.id : uuidv4(),
      description,
      amount,
      date,
      type,
      category,
      documentUrl,
      goalId: type === TransactionType.INVESTMENT && selectedGoalId ? selectedGoalId : undefined
    };

    const previousAmount = editingTransaction ? editingTransaction.amount : undefined;
    const previousGoalId = editingTransaction ? editingTransaction.goalId : undefined;
    
    onSave(newTransaction, selectedGoalId, previousAmount, previousGoalId);
    
    // Feedback to user
    if (!editingTransaction) {
        // Optional: Toast or notification could go here
    }
    resetForm();
  };

  const getCategoryOptions = () => {
    if (type === TransactionType.INCOME) {
        return TRANSACTION_CATEGORY_OPTIONS_FOR_INCOME;
    }
    return TRANSACTION_CATEGORY_OPTIONS.filter(option => 
        option.value !== TransactionCategory.INCOME_SOURCE
    );
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg mb-8 border-t-4 ${editingTransaction ? 'border-orange-500 bg-orange-50' : 'border-blue-600'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${editingTransaction ? 'text-orange-700' : 'text-gray-800'}`}>
          {editingTransaction ? '✏️ Editando Transação' : 'Adicionar Nova Transação'}
        </h2>
        {editingTransaction && (
           <button onClick={onCancel} className="text-sm text-red-600 underline">Cancelar Edição</button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* File Upload & AI Button Section - Moved to top for UX flow */}
        <div className="col-span-1 sm:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
            Comprovante (Foto/PDF)
          </label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              type="file"
              id="document"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            />
            {documentUrl && !editingTransaction && (
              <button
                type="button"
                onClick={handleAutoFillFromImage}
                disabled={isProcessingImage}
                className={`
                  flex items-center justify-center px-4 py-2 rounded-md text-white text-sm font-bold shadow-sm whitespace-nowrap
                  ${isProcessingImage ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'}
                `}
              >
                {isProcessingImage ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Lendo imagem...
                  </>
                ) : (
                  '✨ Preencher com IA'
                )}
              </button>
            )}
          </div>
          {documentUrl && (
             <p className="mt-2 text-xs text-gray-500">
              {editingTransaction 
                ? "Comprovante anexado." 
                : "Dica: Use o botão 'Preencher com IA' para extrair valor e data automaticamente."}
             </p>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="Ex: Aluguel, Salário, Supermercado"
            required
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Valor (R$)
          </label>
          <CurrencyInput
            id="amount"
            value={amount}
            onChange={setAmount}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-lg font-semibold text-gray-700"
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Data
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          >
            {TRANSACTION_TYPES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          >
            {getCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {type === TransactionType.INVESTMENT && (
           <div className="col-span-1 sm:col-span-2 bg-indigo-50 p-4 rounded-md border border-indigo-100">
             <label htmlFor="goal" className="block text-sm font-medium text-indigo-700 mb-1">
               Vincular a uma Meta (Opcional)
             </label>
             <p className="text-xs text-indigo-500 mb-2">O valor será adicionado automaticamente ao progresso da meta selecionada.</p>
             <select
               id="goal"
               value={selectedGoalId}
               onChange={(e) => setSelectedGoalId(e.target.value)}
               className="w-full p-3 border border-indigo-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
             >
               <option value="">-- Selecione uma Meta --</option>
               {goals.map((goal) => (
                 <option key={goal.id} value={goal.id}>
                   {goal.name} (Faltam R$ {(goal.targetAmount - goal.currentAmount).toFixed(2)})
                 </option>
               ))}
             </select>
           </div>
        )}

        <div className="col-span-1 sm:col-span-2 flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-6 py-3 text-white rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out font-semibold ${editingTransaction ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
          >
            {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;

import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { v4 as uuidv4 } from 'uuid';
import CurrencyInput from './CurrencyInput';

interface GoalFormProps {
  onSave: (goal: Goal) => void;
  onCancel: () => void;
  editingGoal?: Goal | null;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSave, onCancel, editingGoal }) => {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState(today);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount);
      setCurrentAmount(editingGoal.currentAmount);
      setDeadline(editingGoal.deadline);
      setNotes(editingGoal.notes);
    } else {
      resetForm();
    }
  }, [editingGoal]);

  const resetForm = () => {
    setName('');
    setTargetAmount(0);
    setCurrentAmount(0);
    setDeadline(today);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || targetAmount <= 0) {
      alert('Por favor, preencha o nome da meta e um valor alvo maior que zero.');
      return;
    }

    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : uuidv4(),
      name,
      targetAmount,
      currentAmount,
      deadline,
      notes,
    };
    onSave(newGoal);
    resetForm();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-t-4 border-indigo-600">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingGoal ? 'Editar Meta Financeira' : 'Adicionar Nova Meta Financeira'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Meta
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="Ex: Fundo de Emergência, Entrada da Casa"
            required
          />
        </div>
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Valor Alvo (R$)
          </label>
          <CurrencyInput
            id="targetAmount"
            value={targetAmount}
            onChange={setTargetAmount}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div>
          <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Valor Já Guardado (R$)
          </label>
          <CurrencyInput
            id="currentAmount"
            value={currentAmount}
            onChange={setCurrentAmount}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Prazo Final
          </label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notas/Ações (como poupar, investir, etc.)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder="Ex: Poupar R$500 por mês, investir em CDB..."
          ></textarea>
        </div>
        <div className="col-span-1 sm:col-span-2 flex justify-end space-x-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            {editingGoal ? 'Salvar Alterações' : 'Adicionar Meta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;


import React from 'react';
import { Goal } from '../types';

interface GoalListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Minhas Metas Financeiras</h2>
      {goals.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Nenhuma meta registrada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const progressBarWidth = Math.min(100, Math.max(0, progress)); // Clamp between 0 and 100
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{goal.name}</h3>
                <p className="text-gray-600 text-sm">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Atual: R$ {goal.currentAmount.toFixed(2)}</span>
                    <span>Alvo: R$ {goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className={`h-2.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressBarWidth}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">{progressBarWidth.toFixed(0)}% completo</p>
                </div>
                <p className="text-gray-700 text-sm italic mt-3">{goal.notes}</p>
                <div className="flex justify-end space-x-3 mt-5">
                  <button
                    onClick={() => onEdit(goal)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(goal.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium transition duration-150 ease-in-out"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalList;

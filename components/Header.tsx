
import React from 'react';

interface HeaderProps {
  onNavigate: (section: 'dashboard' | 'transactions' | 'goals' | 'reports') => void;
  activeSection: 'dashboard' | 'transactions' | 'goals' | 'reports';
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
  const navItems = [
    { name: 'Dashboard', section: 'dashboard' },
    { name: 'Transações', section: 'transactions' },
    { name: 'Metas', section: 'goals' },
    { name: 'Relatórios', section: 'reports' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md p-4 sm:p-6 sticky top-0 z-10">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">
          Controle Financeiro Pessoal
        </h1>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-end">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => onNavigate(item.section as any)}
              className={`
                px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200
                ${activeSection === item.section
                  ? 'bg-white text-blue-700 shadow-inner'
                  : 'text-white hover:bg-blue-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'}
              `}
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;

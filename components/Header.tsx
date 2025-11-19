import React, { useRef } from 'react';

interface HeaderProps {
  onNavigate: (section: 'dashboard' | 'transactions' | 'goals' | 'reports') => void;
  activeSection: 'dashboard' | 'transactions' | 'goals' | 'reports';
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navItems = [
    { name: 'Dashboard', section: 'dashboard' },
    { name: 'Transações', section: 'transactions' },
    { name: 'Metas', section: 'goals' },
    { name: 'Relatórios', section: 'reports' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md p-4 sm:p-6 sticky top-0 z-10">
      <div className="container mx-auto flex flex-col xl:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold mb-4 xl:mb-0 flex items-center gap-2">
          <span className="text-4xl">💰</span> Controle Financeiro
        </h1>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <nav className="flex flex-wrap gap-2 justify-center">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => onNavigate(item.section as any)}
                className={`
                  px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200
                  ${activeSection === item.section
                    ? 'bg-white text-blue-700 shadow-inner'
                    : 'text-white hover:bg-blue-500 hover:bg-opacity-75'}
                `}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Backup / Restore Controls */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-blue-400 pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0">
             <button
               onClick={onExport}
               className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 rounded text-xs flex items-center gap-1 transition-colors"
               title="Salvar backup dos dados"
             >
               📥 <span className="hidden sm:inline">Backup</span>
             </button>
             
             <button
               onClick={() => fileInputRef.current?.click()}
               className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs flex items-center gap-1 transition-colors"
               title="Restaurar dados de um arquivo"
             >
               📤 <span className="hidden sm:inline">Restaurar</span>
             </button>
             <input
               type="file"
               ref={fileInputRef}
               onChange={onImport}
               accept=".json"
               className="hidden"
             />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
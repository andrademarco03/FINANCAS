
export enum TransactionType {
  INCOME = 'INCOME',
  FIXED_EXPENSE = 'FIXED_EXPENSE',
  VARIABLE_EXPENSE = 'VARIABLE_EXPENSE',
  INVESTMENT = 'INVESTMENT', // Special type of expense that feeds into investments/savings
}

export enum TransactionCategory {
  HOUSING = 'Moradia/Habitação',
  FOOD = 'Alimentação',
  HEALTH = 'Saúde',
  TRANSPORT = 'Transporte',
  EDUCATION = 'Educação',
  PERSONAL_LEISURE = 'Despesas Pessoais e Lazer',
  DEBTS_FINANCIAL = 'Dívidas e Serviços Financeiros',
  INVESTMENTS_SAVINGS = 'Investimentos/Poupança', // This is primarily for 'INVESTMENT' type
  UNCATEGORIZED = 'Não Categorizado',
  INCOME_SOURCE = 'Fonte de Renda', // For income transactions

  // Detailed Variable Expenses
  SUPERMARKET_PURCHASES = 'Compras de supermercado',
  EATING_OUT = 'Refeições fora de casa',
  CINEMA = 'Cinema',
  RESTAURANTS = 'Restaurantes',
  RECREATIONAL_ACTIVITIES = 'Atividades recreativas',
  CLOTHING_FOOTWEAR = 'Compras de roupas e calçados',
  FOOD_DELIVERY = 'Entrega de comida ao domicílio',
  FUEL = 'Combustível',
  PUBLIC_TRANSPORT = 'Transporte público',
  VEHICLE_MAINTENANCE = 'Manutenção do veículo',
  GIFTS = 'Presentes',

  // Detailed Fixed Expenses
  RENT_HOME_LOAN = 'Aluguel ou prestação da casa',
  CONDOMINIUM_FEE = 'Condomínio',
  UTILITIES = 'Contas de água, luz e gás',
  INTERNET_PHONE = 'Internet e telefone',
  LOAN_PAYMENTS = 'Pagamentos de empréstimos',
  STREAMING_SUBSCRIPTIONS = 'Assinaturas de sites de streaming ou canais pagos',
  HOME_CAR_INSURANCE = 'Seguro residencial ou do carro',
  CLUB_MEMBERSHIPS = 'Clubes e taxas de adesão',
  SCHOOL_UNIVERSITY_FEES = 'Mensalidade de escolas ou faculdades',
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: TransactionCategory;
  documentUrl?: string; // Optional: URL for uploaded document
  goalId?: string; // Optional: Link to a goal (for investments)
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  notes: string;
}

export interface Summary {
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalInvestments: number;
  netBalance: number;
}

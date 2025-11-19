
import { TransactionType, TransactionCategory } from './types';

export const TRANSACTION_TYPES_OPTIONS = [
  { value: TransactionType.INCOME, label: 'Receita' },
  { value: TransactionType.FIXED_EXPENSE, label: 'Despesa Fixa' },
  { value: TransactionType.VARIABLE_EXPENSE, label: 'Despesa Variável' },
  { value: TransactionType.INVESTMENT, label: 'Investimento/Poupança' },
];

export const TRANSACTION_CATEGORY_OPTIONS = [
  // Existing broader categories
  { value: TransactionCategory.HOUSING, label: 'Moradia/Habitação' },
  { value: TransactionCategory.FOOD, label: 'Alimentação' },
  { value: TransactionCategory.HEALTH, label: 'Saúde' },
  { value: TransactionCategory.TRANSPORT, label: 'Transporte' },
  { value: TransactionCategory.EDUCATION, label: 'Educação' },
  { value: TransactionCategory.PERSONAL_LEISURE, label: 'Despesas Pessoais e Lazer' },
  { value: TransactionCategory.DEBTS_FINANCIAL, label: 'Dívidas e Serviços Financeiros' },
  { value: TransactionCategory.INVESTMENTS_SAVINGS, label: 'Investimentos/Poupança' },
  { value: TransactionCategory.UNCATEGORIZED, label: 'Não Categorizado' },

  // Detailed Variable Expenses, mapped to broader categories for internal consistency
  { value: TransactionCategory.SUPERMARKET_PURCHASES, label: 'Compras de supermercado' },
  { value: TransactionCategory.EATING_OUT, label: 'Refeições fora de casa' },
  { value: TransactionCategory.CINEMA, label: 'Cinema' },
  { value: TransactionCategory.RESTAURANTS, label: 'Restaurantes' },
  { value: TransactionCategory.RECREATIONAL_ACTIVITIES, label: 'Atividades recreativas' },
  { value: TransactionCategory.CLOTHING_FOOTWEAR, label: 'Compras de roupas e calçados' },
  { value: TransactionCategory.FOOD_DELIVERY, label: 'Entrega de comida ao domicílio' },
  { value: TransactionCategory.FUEL, label: 'Combustível' },
  { value: TransactionCategory.PUBLIC_TRANSPORT, label: 'Transporte público' },
  { value: TransactionCategory.VEHICLE_MAINTENANCE, label: 'Manutenção do veículo' },
  { value: TransactionCategory.GIFTS, label: 'Presentes' },

  // Detailed Fixed Expenses, mapped to broader categories for internal consistency
  { value: TransactionCategory.RENT_HOME_LOAN, label: 'Aluguel ou prestação da casa' },
  { value: TransactionCategory.CONDOMINIUM_FEE, label: 'Condomínio' },
  { value: TransactionCategory.UTILITIES, label: 'Contas de água, luz e gás' },
  { value: TransactionCategory.INTERNET_PHONE, label: 'Internet e telefone' },
  { value: TransactionCategory.LOAN_PAYMENTS, label: 'Pagamentos de empréstimos' },
  { value: TransactionCategory.STREAMING_SUBSCRIPTIONS, label: 'Assinaturas de sites de streaming ou canais pagos' },
  { value: TransactionCategory.HOME_CAR_INSURANCE, label: 'Seguro residencial ou do carro' },
  { value: TransactionCategory.CLUB_MEMBERSHIPS, label: 'Clubes e taxas de adesão' },
  { value: TransactionCategory.SCHOOL_UNIVERSITY_FEES, label: 'Mensalidade de escolas ou faculdades' },
];

export const TRANSACTION_CATEGORY_OPTIONS_FOR_INCOME = [
  { value: TransactionCategory.INCOME_SOURCE, label: 'Fonte de Renda' },
  { value: TransactionCategory.UNCATEGORIZED, label: 'Não Categorizado' },
];

export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'financial_control_transactions';
export const LOCAL_STORAGE_GOALS_KEY = 'financial_control_goals';
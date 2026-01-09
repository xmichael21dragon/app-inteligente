
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum AccountType {
  BANK = 'BANK',
  WALLET = 'WALLET',
  INVESTMENT = 'INVESTMENT',
  SAVINGS = 'SAVINGS'
}

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number; // Calculated
  color: string;
  pixKey?: string; // Nova propriedade para chave PIX da conta
}

export interface CreditCard {
  id: string;
  user_id?: string;
  name: string;
  limitTotal: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  date: string; // ISO Date string YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  accountId?: string; // If null, might be a credit card expense before payment
  cardId?: string; // If present, belongs to a credit card invoice
  isPaid: boolean;
  installmentCurrent?: number;
  installmentTotal?: number;
  relatedTransactionId?: string; // For installments grouping
  relatedRecurringId?: string; // Links generated transaction to its config
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  dayOfMonth: number; // 1-31
  type: TransactionType;
  categoryId: string;
  accountId?: string;
  cardId?: string;
  active: boolean;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

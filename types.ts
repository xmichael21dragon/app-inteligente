
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
  pixKey?: string; 
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
  accountId?: string; 
  cardId?: string; 
  isPaid: boolean;
  installmentCurrent?: number;
  installmentTotal?: number;
  relatedTransactionId?: string; 
  relatedRecurringId?: string; 
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

export interface UserSettings {
  notifyClosingDays: number;
  notifyDueDays: number;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}


import { Account, AccountType, CreditCard, Transaction, TransactionType, Category, RecurringTransaction, UserSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

export const PAYMENT_CONFIG = {
  pixKey: "SuaChaveAqui@email.com", 
  pixName: "Seu Nome Completo", 
  checkoutLink: "https://seu-link-de-pagamento-externo.com", 
  supportEmail: "seu-suporte@email.com",
  activationNotice: "Após o pagamento, insira o ID da transação para verificação manual (até 24h)."
};

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkdwijxqkfgnubufqajk.supabase.co'; 
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZHdpanhxa2ZnbnVidWZxYWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTQ0NzEsImV4cCI6MjA4MDg5MDQ3MX0.yt88b4dhceFVxZ98RU5UB_FyP_hEwtz32T_m1qkx2d0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) as any;

class DataService {
  
  private getCache(key: string) {
    try {
      const encrypted = localStorage.getItem(`c_sec_${key}`);
      if (!encrypted) return null;
      const decoded = atob(encrypted);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  private setCache(key: string, data: any) {
    try {
      const stringData = JSON.stringify(data);
      const encoded = btoa(stringData);
      localStorage.setItem(`c_sec_${key}`, encoded);
    } catch (e) {
      console.error("Secure Cache Write Error", e);
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }

  async checkPremiumStatus(): Promise<boolean> {
    const cached = this.getCache('premium_status');
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return cached || false;
      const { data, error } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
      if (error) return cached || false;
      const status = data?.is_premium || false;
      this.setCache('premium_status', status);
      return status;
    } catch (e) {
      return cached || false;
    }
  }

  getNotificationSettings(): UserSettings {
    const saved = this.getCache('notification_settings');
    return saved || { notifyClosingDays: 3, notifyDueDays: 5 };
  }

  saveNotificationSettings(settings: UserSettings): void {
    this.setCache('notification_settings', settings);
  }

  async fetchAccounts(useCache = true): Promise<Account[]> {
    if (useCache) {
      const cached = this.getCache('accounts');
      if (cached) return cached;
    }
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await supabase.from('accounts').select('*').eq('user_id', userId).order('name');
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type as AccountType,
        initialBalance: Number(row.initial_balance || 0),
        currentBalance: Number(row.initial_balance || 0),
        color: row.color,
        pixKey: row.pix_key,
        user_id: row.user_id
      }));
      this.setCache('accounts', mapped);
      return mapped;
    } catch (e) {
      return this.getCache('accounts') || [];
    }
  }

  async fetchTransactions(useCache = true): Promise<Transaction[]> {
    if (useCache) {
      const cached = this.getCache('transactions');
      if (cached) return cached;
    }
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        description: row.description,
        amount: Number(row.amount || 0),
        date: row.date,
        type: row.type as TransactionType,
        categoryId: row.category_id,
        accountId: row.account_id || undefined,
        cardId: row.card_id || undefined,
        isPaid: row.is_paid,
        installmentCurrent: row.installment_current,
        installmentTotal: row.installment_total,
        relatedTransactionId: row.related_transaction_id,
        relatedRecurringId: row.related_recurring_id,
        user_id: row.user_id
      }));
      this.setCache('transactions', mapped);
      return mapped;
    } catch (e) {
      return this.getCache('transactions') || [];
    }
  }

  async upsertTransactions(transactions: Transaction[]): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const dbTransactions = transactions.map(t => ({
      id: t.id,
      user_id: userId,
      description: t.description.substring(0, 100),
      amount: t.amount,
      date: t.date,
      type: t.type,
      category_id: t.categoryId,
      account_id: t.accountId || null,
      card_id: t.cardId || null,
      is_paid: t.isPaid,
      installment_current: t.installmentCurrent || null,
      installment_total: t.installmentTotal || null,
      related_transaction_id: t.relatedTransactionId || null,
      related_recurring_id: t.relatedRecurringId || null,
    }));
    const { error } = await supabase.from('transactions').upsert(dbTransactions);
    if (!error) {
      localStorage.removeItem('c_sec_transactions');
      localStorage.removeItem('c_sec_accounts'); // Clear accounts too since balance might change
    }
    return !error;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
    if (!error) {
      localStorage.removeItem('c_sec_transactions');
      localStorage.removeItem('c_sec_accounts');
    }
    return !error;
  }

  async fetchCards(useCache = true): Promise<CreditCard[]> {
    if (useCache) {
      const cached = this.getCache('cards');
      if (cached) return cached;
    }
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];
      const { data, error } = await supabase.from('credit_cards').select('*').eq('user_id', userId).order('name');
      if (error) throw error;
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        limitTotal: Number(row.limit_total || 0),
        closingDay: Number(row.closing_day || 1),
        dueDay: Number(row.due_day || 1),
        color: row.color,
        user_id: row.user_id
      }));
      this.setCache('cards', mapped);
      return mapped;
    } catch (e) {
      return this.getCache('cards') || [];
    }
  }

  async upsertCard(card: CreditCard): Promise<CreditCard | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;
    const payload = {
      id: card.id || uuidv4(),
      user_id: userId,
      name: card.name,
      limit_total: card.limitTotal,
      closing_day: card.closingDay,
      due_day: card.dueDay,
      color: card.color
    };
    const { error } = await supabase.from('credit_cards').upsert(payload);
    if (error) return null;
    localStorage.removeItem('c_sec_cards');
    return { ...card, id: payload.id };
  }

  async deleteCard(cardId: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from('credit_cards').delete().eq('id', cardId).eq('user_id', userId);
    if (!error) localStorage.removeItem('c_sec_cards');
    return !error;
  }

  async payCardInvoice(cardId: string, accountId: string, amount: number, cardName: string, selectedMonthDate: Date): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;

    const month = selectedMonthDate.getMonth() + 1;
    const year = selectedMonthDate.getFullYear();
    const monthStr = String(month).padStart(2, '0');
    
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    const paymentTx: any = {
      id: uuidv4(),
      user_id: userId,
      description: `PAGTO FATURA: ${cardName} (${monthStr}/${year})`,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      category_id: 'payment', 
      account_id: accountId,
      is_paid: true
    };

    const { error: txError } = await supabase.from('transactions').insert(paymentTx);
    if (txError) return false;

    const { error: updateError } = await supabase
      .from('transactions')
      .update({ is_paid: true })
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .eq('is_paid', false)
      .gte('date', startDate)
      .lte('date', endDate);

    if (!updateError) {
      localStorage.removeItem('c_sec_transactions');
      localStorage.removeItem('c_sec_accounts');
    }
    return !updateError;
  }

  fetchRecurringConfigs(): RecurringTransaction[] {
    return this.getCache('recurring_configs') || [];
  }

  saveRecurringConfig(config: RecurringTransaction): void {
    const configs = this.fetchRecurringConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    if (index >= 0) configs[index] = config;
    else configs.push(config);
    this.setCache('recurring_configs', configs);
  }

  deleteRecurringConfig(id: string): void {
    const configs = this.fetchRecurringConfigs();
    const filtered = configs.filter(c => c.id !== id);
    this.setCache('recurring_configs', filtered);
  }

  async processRecurringTransactions(txs: Transaction[], configs: RecurringTransaction[]): Promise<Transaction[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const newTxs: Transaction[] = [];
    for (const config of configs) {
      if (!config.active) continue;
      const alreadyExists = txs.some(t => 
        t.relatedRecurringId === config.id && 
        new Date(t.date).getMonth() + 1 === currentMonth && 
        new Date(t.date).getFullYear() === currentYear
      );
      if (!alreadyExists) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(config.dayOfMonth).padStart(2, '0')}`;
        newTxs.push({
          id: uuidv4(),
          user_id: userId,
          description: config.description,
          amount: config.amount,
          date: dateStr,
          type: config.type,
          categoryId: config.categoryId,
          accountId: config.accountId,
          cardId: config.cardId,
          isPaid: config.type === TransactionType.INCOME || (!!config.accountId && config.type === TransactionType.EXPENSE),
          relatedRecurringId: config.id
        });
      }
    }
    if (newTxs.length > 0) await this.upsertTransactions(newTxs);
    return newTxs;
  }

  async upsertAccount(account: Account): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from('accounts').upsert({
      id: account.id || uuidv4(),
      user_id: userId,
      name: account.name,
      type: account.type,
      initial_balance: account.initialBalance,
      color: account.color,
      pix_key: account.pixKey
    });
    if (!error) localStorage.removeItem('c_sec_accounts');
    return !error;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', userId);
    if (!error) localStorage.removeItem('c_sec_accounts');
    return !error;
  }

  async upsertCategory(category: Category): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from('categories').upsert({
      id: category.id || uuidv4(),
      user_id: userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type
    });
    if (!error) localStorage.removeItem('c_sec_categories');
    return !error;
  }

  async requestActivation(pixId: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from('payment_requests').insert({
      user_id: userId,
      transaction_id: pixId,
      status: 'pending'
    });
    return !error;
  }

  calculateBalances(accounts: Account[], transactions: Transaction[]): Account[] {
    const accountMap = new Map(accounts.map(a => [a.id, { ...a, currentBalance: a.initialBalance }]));
    transactions.forEach(t => {
      if (!t.isPaid || !t.accountId) return; 
      const acc = accountMap.get(t.accountId);
      if (acc) {
        if (t.type === TransactionType.INCOME) acc.currentBalance += t.amount;
        else if (t.type === TransactionType.EXPENSE) acc.currentBalance -= t.amount;
      }
    });
    return Array.from(accountMap.values());
  }

  prepareTransactionWithInstallments(t: Omit<Transaction, 'id'>, card: CreditCard | undefined): Transaction[] {
    const newTransactions: Transaction[] = [];
    const baseId = uuidv4();
    if (t.installmentTotal && t.installmentTotal > 1 && t.cardId && card) {
      const baseDate = new Date(t.date);
      const installmentValue = parseFloat((t.amount / t.installmentTotal).toFixed(2));
      const totalCalculated = installmentValue * t.installmentTotal;
      const diff = t.amount - totalCalculated;
      for (let i = 0; i < t.installmentTotal; i++) {
        const isLast = i === t.installmentTotal - 1;
        const finalAmount = isLast ? installmentValue + diff : installmentValue;
        const date = new Date(baseDate);
        date.setMonth(baseDate.getMonth() + i);
        newTransactions.push({
          ...t,
          id: uuidv4(),
          date: date.toISOString().split('T')[0],
          amount: finalAmount,
          installmentCurrent: i + 1,
          relatedTransactionId: baseId,
          installmentTotal: t.installmentTotal
        } as Transaction);
      }
    } else {
      newTransactions.push({ ...t, id: baseId } as Transaction);
    }
    return newTransactions;
  }

  async fetchCategories(useCache = true): Promise<Category[]> {
    if (useCache) {
      const cached = this.getCache('categories');
      if (cached) return cached;
    }
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase.from('categories').select('*').or(`user_id.is.null,user_id.eq.${userId}`).order('name');
      if (error) return this.getCache('categories') || [];
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        type: row.type as TransactionType
      }));
      this.setCache('categories', mapped);
      return mapped;
    } catch {
      return this.getCache('categories') || [];
    }
  }
}

export const dataService = new DataService();

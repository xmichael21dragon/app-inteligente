
import React from 'react';
import { Account, Transaction, CreditCard, TransactionType, AccountType } from '../types';
import { Eye, EyeOff, TrendingUp, TrendingDown, CreditCard as CardIcon, ChevronLeft, ChevronRight, Wallet, PiggyBank, RefreshCw } from 'lucide-react';
import AccountModal from './AccountModal';
import { useLanguage } from '../contexts/LanguageContext';
import SmartLogo from './SmartLogo';
import AdBanner from './AdBanner';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  cards: CreditCard[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddTransaction: () => void;
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  isPremium?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  accounts, 
  transactions, 
  cards, 
  currentDate,
  onPrevMonth,
  onNextMonth,
  onSaveAccount,
  onDeleteAccount,
  onEditTransaction,
  isPremium = false,
  onRefresh,
  isRefreshing = false
}) => {
  const { t, locale, fCurrency } = useLanguage();
  const [showValues, setShowValues] = React.useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);

  const savingsAccountIds = new Set(
    accounts
      .filter(a => a.type === AccountType.SAVINGS || a.type === AccountType.INVESTMENT)
      .map(a => a.id)
  );

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthTransactions = transactions.filter(t => {
    const [tYear, tMonth] = t.date.split('-').map(Number);
    return tMonth === month + 1 && tYear === year;
  });

  const operationalTransactions = monthTransactions.filter(t => {
    if (t.accountId) return !savingsAccountIds.has(t.accountId);
    return true;
  });

  const monthlyIncome = operationalTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = operationalTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyResult = monthlyIncome - monthlyExpense;

  const getCardInvoiceForMonth = (cardId: string) => {
    return monthTransactions
      .filter(t => t.cardId === cardId)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const formatValue = (val: number) => {
    if (!showValues) return '••••';
    return fCurrency(val);
  };

  const monthName = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 right-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -mr-12 -mt-12">
          <SmartLogo size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t('dash.result')}</p>
              <h2 className={`text-4xl font-black tracking-tight ${monthlyResult < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
                  {formatValue(monthlyResult)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={onRefresh} 
                  disabled={isRefreshing}
                  className={`bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-slate-400 hover:text-accent transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw size={22} />
                </button>
                <button onClick={() => setShowValues(!showValues)} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-slate-400 hover:text-accent transition-all">
                  {showValues ? <Eye size={22} /> : <EyeOff size={22} />}
                </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-8">
              <button onClick={onPrevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"><ChevronLeft size={24} /></button>
              <span className="font-black text-slate-800 dark:text-white capitalize text-xl">{monthName}</span>
              <button onClick={onNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"><ChevronRight size={24} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-3xl border border-green-100 dark:border-green-900/20">
                 <p className="text-[10px] text-green-600/60 dark:text-green-400/60 uppercase font-black mb-1 tracking-widest">{t('dash.income')}</p>
                 <p className="text-2xl font-black text-green-600 dark:text-green-400 truncate">{formatValue(monthlyIncome)}</p>
              </div>
              <div className="bg-red-50/50 dark:bg-red-900/10 p-4 rounded-3xl border border-red-100 dark:border-red-900/20">
                 <p className="text-[10px] text-red-600/60 dark:text-red-400/60 uppercase font-black mb-1 tracking-widest">{t('dash.expense')}</p>
                 <p className="text-2xl font-black text-red-600 dark:text-red-400 truncate">{formatValue(monthlyExpense)}</p>
              </div>
            </div>
          </div>

          {!isPremium && <AdBanner className="my-6" />}

          <div>
            <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Wallet size={16} />
                  </div>
                  <span>Extrato Mensal</span>
                </h3>
                {isRefreshing && <span className="text-[10px] font-black text-accent animate-pulse uppercase tracking-widest">Sincronizando...</span>}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              {monthTransactions.length > 0 ? (
                monthTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t, idx) => (
                  <React.Fragment key={t.id}>
                    <button onClick={() => onEditTransaction(t)} className="w-full flex items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all text-left group">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${t.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                          {t.type === TransactionType.INCOME ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{t.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tighter">
                            {new Date(t.date).toLocaleDateString(locale, {day: '2-digit', month: 'long'})}
                            {t.accountId && savingsAccountIds.has(t.accountId) && <span className="ml-2 px-1.5 py-0.5 bg-accent/10 text-accent rounded text-[8px] font-black">APORTE</span>}
                          </p>
                        </div>
                      </div>
                      <span className={`font-black text-lg ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {formatValue(t.amount)}
                      </span>
                    </button>
                    {!isPremium && idx > 0 && idx % 10 === 0 && (
                      <div className="p-4 border-b border-slate-50 dark:border-slate-800/50">
                        <AdBanner format="horizontal" minHeight="60px" />
                      </div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Wallet size={48} className="mb-4 opacity-10" /><p className="text-xs font-black uppercase tracking-widest">{t('dash.no_transactions')}</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white mb-5 px-1 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <CardIcon size={16} />
              </div>
              <span>Faturas</span>
            </h3>
            {cards.length > 0 ? (
              <div className="space-y-4">
                {cards.map(card => {
                  const invoiceAmount = getCardInvoiceForMonth(card.id);
                  return (
                    <div key={card.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center group hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-lg`}><CardIcon size={22} /></div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white text-base">{card.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Vence Dia {card.dueDay}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-800 dark:text-white text-lg">{formatValue(invoiceAmount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum cartão cadastrado.</div>
            )}
          </div>
          {!isPremium && <AdBanner format="rectangle" minHeight="250px" className="rounded-3xl" />}
        </div>
      </div>

      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={onSaveAccount} onDelete={onDeleteAccount} initialData={editingAccount} />
    </div>
  );
};

export default Dashboard;

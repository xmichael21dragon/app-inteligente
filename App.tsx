
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, CreditCard, PieChart, Plus, Settings, PiggyBank, LogOut, Crown, Repeat, Globe, Sun, Moon, BellRing } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import CreditCards from './components/CreditCards';
import Investments from './components/Investments';
import TransactionModal from './components/TransactionModal';
import CategoryModal from './components/CategoryModal';
import Auth from './components/Auth';
import PremiumModal from './components/PremiumModal';
import RecurringModal from './components/RecurringModal';
import SmartLogo from './components/SmartLogo';
import AdBanner from './components/AdBanner';
import { dataService, supabase } from './services/store';
import { Account, Transaction, CreditCard as CreditCardType, Category, RecurringTransaction, UserSettings } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

enum View {
  DASHBOARD = 'DASHBOARD',
  CARDS = 'CARDS',
  INVESTMENTS = 'INVESTMENTS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

const App: React.FC = () => {
  const { t, setLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPremium, setIsPremium] = useState(false); 
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]); 
  
  const [settings, setSettings] = useState<UserSettings>(dataService.getNotificationSettings());

  useEffect(() => {
    const hydrate = async () => {
      const [cachedAccs, cachedTxs, cachedCards, cachedCats] = await Promise.all([
        dataService.fetchAccounts(true),
        dataService.fetchTransactions(true),
        dataService.fetchCards(true),
        dataService.fetchCategories(true)
      ]);
      
      const cachedPremium = localStorage.getItem('cache_premium_status') === 'true';
      
      setAccounts(cachedAccs || []);
      setTransactions(cachedTxs || []);
      setCards(cachedCards || []);
      setCategories(cachedCats || []);
      setIsPremium(cachedPremium);
      
      if (cachedAccs && cachedAccs.length > 0) {
        setLoading(false);
        const loader = document.getElementById('app-loader');
        if (loader) loader.style.display = 'none';
      }
    };
    
    hydrate();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (!initialSession) {
          setLoading(false);
          const loader = document.getElementById('app-loader');
          if (loader) loader.style.display = 'none';
        } else {
          refreshData();
          checkPremium();
        }
      } catch (err) {
        setLoading(false);
        const loader = document.getElementById('app-loader');
        if (loader) loader.style.display = 'none';
      }
    };

    initAuth();

    const { data } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (session) {
        refreshData();
        checkPremium();
      }
    });

    return () => {
      if (data?.subscription) data.subscription.unsubscribe();
    };
  }, []);

  const checkPremium = async () => {
    const status = await dataService.checkPremiumStatus();
    setIsPremium(status);
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const [accs, txs, cds, cats] = await Promise.all([
        dataService.fetchAccounts(false),
        dataService.fetchTransactions(false),
        dataService.fetchCards(false),
        dataService.fetchCategories(false)
      ]);
      
      const recurring = dataService.fetchRecurringConfigs();
      setRecurringList(recurring);
      
      const newAutoTransactions = await dataService.processRecurringTransactions(txs, recurring);
      const allTransactions = [...txs, ...newAutoTransactions];
      const updatedAccounts = dataService.calculateBalances(accs, allTransactions);
      
      setAccounts(updatedAccounts);
      setTransactions(allTransactions);
      setCards(cds);
      setCategories(cats);
      
      setLoading(false);
      const loader = document.getElementById('app-loader');
      if (loader) loader.style.display = 'none';
    } catch (error) {
      console.error("Refresh Error", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    dataService.saveNotificationSettings(newSettings);
  };

  const handleSaveTransaction = async (t: Omit<Transaction, 'id'> | Transaction) => {
    const isUpdate = 'id' in t;
    if (isUpdate) {
      await dataService.upsertTransactions([t as Transaction]);
    } else {
      const card = t.cardId ? cards.find(c => c.id === t.cardId) : undefined;
      const prepared = dataService.prepareTransactionWithInstallments(t, card);
      await dataService.upsertTransactions(prepared);
    }
    refreshData();
    setIsModalOpen(false);
  };
  
  const handleDeleteTransaction = async (id: string) => {
    await dataService.deleteTransaction(id);
    refreshData();
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  if (loading && (!accounts || accounts.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) return <Auth />;

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`flex flex-col lg:flex-row items-center lg:space-x-3 justify-center lg:justify-start w-full px-2 lg:px-4 py-3 rounded-2xl transition-all duration-300 ${currentView === view ? 'text-accent bg-accent/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
    >
      <Icon size={20} className="shrink-0" />
      <span className="hidden lg:block text-sm font-bold">{label}</span>
    </button>
  );

  const MobileNavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentView(view)} 
      className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${currentView === view ? 'text-accent' : 'text-slate-400'}`}
    >
      <Icon size={24} className={currentView === view ? 'scale-110' : ''} />
      <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col md:flex-row transition-colors duration-500">
      <aside className="hidden md:flex flex-col w-20 lg:w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 lg:p-6 z-40 shadow-sm transition-all duration-500">
        <div className="flex items-center justify-center lg:justify-start lg:space-x-4 mb-12 mt-2 group">
          <SmartLogo size="sm" />
          <div className="hidden lg:flex flex-col">
            <span className="font-black text-lg tracking-tight leading-none text-slate-800 dark:text-white">Carteira</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inteligente</span>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label={t('nav.dashboard')} />
          <NavItem view={View.CARDS} icon={CreditCard} label={t('nav.cards')} />
          <button onClick={() => setIsRecurringModalOpen(true)} className="flex flex-col lg:flex-row items-center lg:space-x-3 justify-center lg:justify-start w-full px-2 lg:px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
            <Repeat size={20} />
            <span className="hidden lg:block text-sm font-bold ml-3">{t('nav.recurring')}</span>
          </button>
          <NavItem view={View.INVESTMENTS} icon={PiggyBank} label={t('nav.investments')} />
          <NavItem view={View.REPORTS} icon={PieChart} label={t('nav.reports')} />
        </nav>
        <div className="mt-auto pt-6 space-y-4">
          <button onClick={() => setCurrentView(View.SETTINGS)} className={`flex flex-col lg:flex-row items-center lg:space-x-3 justify-center lg:justify-start w-full px-2 lg:px-4 py-3 rounded-2xl transition-all ${currentView === View.SETTINGS ? 'text-accent bg-accent/5' : 'text-slate-400'}`}>
            <Settings size={20} />
            <span className="hidden lg:block text-sm font-bold ml-3">{t('settings.title')}</span>
          </button>
          <button onClick={async () => await supabase.auth.signOut()} className="flex items-center justify-center lg:justify-start w-full px-2 lg:px-4 py-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all">
            <LogOut size={20} />
            <span className="hidden lg:block text-sm font-bold ml-3">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 md:hidden">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SmartLogo size="sm" />
              <span className="font-black text-base tracking-tight text-slate-800 dark:text-slate-100">Carteira</span>
            </div>
            <button onClick={() => setCurrentView(View.SETTINGS)} className="p-2 text-slate-400 transition-transform active:rotate-90"><Settings size={20} /></button>
          </div>
        </header>

        <main className={`w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pb-32 md:pb-24`}>
          {currentView === View.DASHBOARD && <Dashboard accounts={accounts} transactions={transactions} cards={cards} currentDate={currentDate} onPrevMonth={() => { const d = new Date(currentDate); d.setMonth(d.getMonth()-1); setCurrentDate(d); }} onNextMonth={() => { const d = new Date(currentDate); d.setMonth(d.getMonth()+1); setCurrentDate(d); }} onAddTransaction={() => { setEditingTransaction(null); setIsModalOpen(true); }} onSaveAccount={async (a) => { await dataService.upsertAccount(a); refreshData(); }} onDeleteAccount={async (id) => { await dataService.deleteAccount(id); refreshData(); }} onEditTransaction={handleEditTransaction} isPremium={isPremium} onRefresh={refreshData} isRefreshing={refreshing} />}
          {currentView === View.CARDS && <CreditCards cards={cards} transactions={transactions} accounts={accounts} onSaveCard={async (c) => { await dataService.upsertCard(c); refreshData(); }} onDeleteCard={async (id) => { await dataService.deleteCard(id); refreshData(); }} onRefreshData={refreshData} isPremium={isPremium} onUpgrade={() => setIsPremiumModalOpen(true)} currentMonthDate={currentDate} settings={settings} />}
          {currentView === View.INVESTMENTS && <Investments accounts={accounts} onSaveAccount={async (a) => { await dataService.upsertAccount(a); refreshData(); }} onDeleteAccount={async (id) => { await dataService.deleteAccount(id); refreshData(); }} />}
          {currentView === View.REPORTS && <Reports transactions={transactions} categories={categories} accounts={accounts} currentDate={currentDate} onPrevMonth={() => { const d = new Date(currentDate); d.setMonth(d.getMonth()-1); setCurrentDate(d); }} onNextMonth={() => { const d = new Date(currentDate); d.setMonth(d.getMonth()+1); setCurrentDate(d); }} isPremium={isPremium} onUpgrade={() => setIsPremiumModalOpen(true)} />}
          
          {currentView === View.SETTINGS && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-3xl font-black text-slate-800 dark:text-white">{t('settings.title')}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-3"><Globe size={20} className="text-accent"/><h3 className="font-bold">Idioma</h3></div>
                      <div className="flex gap-2">
                        {['pt', 'en', 'es'].map(lang => (
                          <button key={lang} onClick={() => setLanguage(lang as any)} className={`flex-1 py-2 rounded-xl text-xs font-black border ${language === lang ? 'bg-accent text-white border-accent' : 'border-slate-200 dark:border-slate-700'}`}>{lang.toUpperCase()}</button>
                        ))}
                      </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-3">{theme === 'dark' ? <Moon size={20} className="text-accent"/> : <Sun size={20} className="text-accent"/>}<h3 className="font-bold">Tema</h3></div>
                      <div className="flex gap-2">
                        <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-xl text-xs font-black border ${theme === 'light' ? 'bg-accent text-white border-accent' : 'border-slate-200 dark:border-slate-700'}`}>CLARO</button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-xl text-xs font-black border ${theme === 'dark' ? 'bg-accent text-white border-accent' : 'border-slate-200 dark:border-slate-700'}`}>ESCURO</button>
                      </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><BellRing size={24} /></div>
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white">Antecedência de Alertas</h3>
                        <p className="text-xs text-slate-500 font-medium">Configure quantos dias antes você deseja ser avisado.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fechamento de Fatura</label>
                        <div className="flex items-center gap-3">
                           <input 
                              type="range" min="1" max="15" 
                              value={settings.notifyClosingDays} 
                              onChange={(e) => handleSaveSettings({...settings, notifyClosingDays: parseInt(e.target.value)})}
                              className="flex-1 accent-accent"
                           />
                           <span className="w-8 text-center font-black text-accent">{settings.notifyClosingDays}d</span>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento de Fatura</label>
                        <div className="flex items-center gap-3">
                           <input 
                              type="range" min="1" max="15" 
                              value={settings.notifyDueDays} 
                              onChange={(e) => handleSaveSettings({...settings, notifyDueDays: parseInt(e.target.value)})}
                              className="flex-1 accent-accent"
                           />
                           <span className="w-8 text-center font-black text-accent">{settings.notifyDueDays}d</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <button onClick={() => setIsRecurringModalOpen(true)} className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-sm font-bold">
                    <div className="flex items-center gap-3"><Repeat size={20} className="text-indigo-500" /> {t('nav.recurring')}</div>
                    <Plus size={16} />
                  </button>
                  <button onClick={() => setIsPremiumModalOpen(true)} className="w-full p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-center justify-between text-sm font-bold text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-3"><Crown size={20} /> {isPremium ? 'Plano Ativo: PREMIUM' : 'Upgrade para PRO'}</div>
                    {!isPremium && <Crown size={16} fill="currentColor" />}
                  </button>
                  <button onClick={async () => await supabase.auth.signOut()} className="w-full p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center justify-between text-sm font-bold text-red-500">
                    <div className="flex items-center gap-3"><LogOut size={20} /> Sair da Conta</div>
                  </button>
               </div>
            </div>
          )}
          {!isPremium && <AdBanner className="mt-8" />}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 md:hidden flex items-center justify-around h-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <MobileNavItem view={View.DASHBOARD} icon={LayoutDashboard} label={t('nav.dashboard')} />
        <MobileNavItem view={View.CARDS} icon={CreditCard} label={t('nav.cards')} />
        <button 
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} 
          className="relative -top-8 bg-accent text-white p-5 rounded-full shadow-2xl shadow-accent/40 active:scale-90 transition-transform flex items-center justify-center border-4 border-slate-50 dark:border-slate-950"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
        <MobileNavItem view={View.INVESTMENTS} icon={PiggyBank} label={t('nav.investments')} />
        <MobileNavItem view={View.REPORTS} icon={PieChart} label={t('nav.reports')} />
      </nav>

      <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="hidden md:flex fixed right-8 bottom-8 z-40 bg-accent text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all shadow-accent/30">
        <Plus size={32} />
      </button>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} onDelete={handleDeleteTransaction} accounts={accounts} cards={cards} categories={categories} initialData={editingTransaction} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={async (c) => { await dataService.upsertCategory(c); refreshData(); }} initialData={editingCategory} />
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUpgrade={() => setIsPremium(true)} />
      <RecurringModal isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} onSave={async (r) => { dataService.saveRecurringConfig(r); refreshData(); }} onDelete={(id) => { dataService.deleteRecurringConfig(id); refreshData(); }} recurringList={recurringList} accounts={accounts} cards={cards} categories={categories} isPremium={isPremium} onUpgrade={() => setIsPremiumModalOpen(true)} />
    </div>
  );
};

export default App;

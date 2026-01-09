
import React, { useState, useEffect } from 'react';
import { Transaction, Category, TransactionType, Account, AccountType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, Download, Lock, Target, Pencil, AlertTriangle, PieChart as PieIcon, BarChart3, CircleDashed } from 'lucide-react';
import AdBanner from './AdBanner';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

const Reports: React.FC<ReportsProps> = ({ 
  transactions, 
  categories, 
  accounts,
  currentDate,
  onPrevMonth,
  onNextMonth,
  isPremium,
  onUpgrade
}) => {
  const { t, locale, fCurrency } = useLanguage();
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState('');
  const [chartModel, setChartModel] = useState<'donut' | 'pie' | 'bar'>('donut');

  useEffect(() => {
    const saved = localStorage.getItem('carteira_budgets');
    if (saved) setBudgetLimits(JSON.parse(saved));
  }, []);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const savingsAccountIds = new Set(
    accounts.filter(a => a.type === AccountType.SAVINGS || a.type === AccountType.INVESTMENT).map(a => a.id)
  );

  const filteredTransactions = transactions.filter(t => {
    const [tYear, tMonth] = t.date.split('-').map(Number);
    const isDateMatch = tMonth === month + 1 && tYear === year;
    const isExpense = t.type === TransactionType.EXPENSE;
    const isNotSavings = !t.accountId || !savingsAccountIds.has(t.accountId);
    return isDateMatch && isExpense && isNotSavings;
  });

  const categoryData = filteredTransactions.reduce((acc, t) => {
    const cat = categories.find(c => c.id === t.categoryId);
    const id = cat ? cat.id : 'unknown';
    const name = cat ? cat.name : 'Outros';
    const color = cat ? getTailwindColorHex(cat.color) : '#94a3b8';
    const existing = acc.find(item => item.id === id);
    if (existing) existing.value += t.amount;
    else acc.push({ id, name, value: t.amount, color });
    return acc;
  }, [] as { id: string; name: string; value: number; color: string }[]);

  function getTailwindColorHex(className: string) {
    if (className.includes('orange')) return '#f97316';
    if (className.includes('blue')) return '#3b82f6';
    if (className.includes('gray')) return '#64748b';
    if (className.includes('green')) return '#22c55e';
    if (className.includes('pink')) return '#ec4899';
    if (className.includes('red')) return '#ef4444';
    if (className.includes('teal')) return '#14b8a6';
    if (className.includes('sky')) return '#0ea5e9';
    if (className.includes('rose')) return '#f43f5e';
    if (className.includes('amber')) return '#f59e0b';
    return '#6366f1';
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyDataMap = new Map<number, number>();
  for (let i = 1; i <= daysInMonth; i++) dailyDataMap.set(i, 0);

  filteredTransactions.forEach(t => {
    const day = new Date(t.date).getDate();
    dailyDataMap.set(day, (dailyDataMap.get(day) || 0) + t.amount);
  });

  const barData = Array.from(dailyDataMap.entries()).map(([day, amount]) => ({ day: day.toString(), amount }));
  const totalExpense = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  const handleDownloadCSV = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    
    const headers = ['Data', 'Descricao', 'Valor', 'Categoria', 'Tipo'];
    const rows = transactions.map(t => {
        const cat = categories.find(c => c.id === t.categoryId)?.name || 'Outro';
        return [t.date, t.description, t.amount, cat, t.type];
    });

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carteira_inteligente_${monthName.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveBudget = (categoryId: string) => {
    const newLimits = { ...budgetLimits, [categoryId]: parseFloat(tempLimit) || 0 };
    setBudgetLimits(newLimits);
    localStorage.setItem('carteira_budgets', JSON.stringify(newLimits));
    setEditingCategory(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={onPrevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"><ChevronLeft size={20} /></button>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white capitalize">{monthName}</h2>
            <button onClick={onNextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"><ChevronRight size={20} /></button>
          </div>
          <button onClick={handleDownloadCSV} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all border shadow-sm ${isPremium ? 'border-accent text-accent hover:bg-accent/10' : 'border-slate-200 text-slate-400'}`}>
            {isPremium ? <Download size={16} /> : <Lock size={16} />} CSV
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICO POR CATEGORIA */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-8">
               <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('rep.title')}</h3>
                   <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                      {fCurrency(totalExpense)}
                   </span>
               </div>
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button onClick={() => setChartModel('donut')} className={`p-2.5 rounded-xl transition-all ${chartModel === 'donut' ? 'bg-white dark:bg-slate-700 shadow-sm text-accent' : 'text-slate-400'}`}><CircleDashed size={18} /></button>
                  <button onClick={() => setChartModel('pie')} className={`p-2.5 rounded-xl transition-all ${chartModel === 'pie' ? 'bg-white dark:bg-slate-700 shadow-sm text-accent' : 'text-slate-400'}`}><PieIcon size={18} /></button>
                  <button onClick={() => setChartModel('bar')} className={`p-2.5 rounded-xl transition-all ${chartModel === 'bar' ? 'bg-white dark:bg-slate-700 shadow-sm text-accent' : 'text-slate-400'}`}><BarChart3 size={18} /></button>
               </div>
          </div>
          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartModel === 'bar' ? (
                    <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 700}} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff'}} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>{categoryData.map((e, i) => (<Cell key={i} fill={e.color} />))}</Bar>
                    </BarChart>
                ) : (
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={chartModel === 'donut' ? 70 : 0} outerRadius={90} paddingAngle={4} dataKey="value">
                          {categoryData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff'}} />
                    </PieChart>
                )}
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 font-bold opacity-50">{t('rep.no_data')}</div>)}
          </div>
        </div>

        {/* METAS DE GASTOS */}
        <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden`}>
          <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-accent/10 text-accent rounded-3xl"><Target size={28} /></div>
              <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('rep.goals')}</h3>
                  <p className="text-xs text-slate-500 font-medium">{t('rep.goals_desc')}</p>
              </div>
          </div>
          <div className="space-y-6">
             {categories.filter(c => c.type === TransactionType.EXPENSE).map(cat => {
                const spent = categoryData.find(d => d.id === cat.id)?.value || 0;
                const limit = budgetLimits[cat.id] || 0;
                const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                const isEditing = editingCategory === cat.id;
                return (
                   <div key={cat.id} className="group">
                      <div className="flex justify-between items-end mb-2">
                          <span className={`text-sm font-black ${cat.color} group-hover:scale-105 transition-transform`}>{cat.name}</span>
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{fCurrency(spent)} {limit > 0 && `/ ${fCurrency(limit)}`}</span>
                              <button onClick={() => isPremium ? (setEditingCategory(cat.id), setTempLimit(limit.toString())) : onUpgrade()} className="text-slate-300 hover:text-accent transition-colors">
                                  <Pencil size={12} />
                              </button>
                          </div>
                      </div>
                      {isEditing ? (
                         <div className="flex gap-2 mt-2 animate-in slide-in-from-top-1">
                            <input type="number" autoFocus value={tempLimit} onChange={(e) => setTempLimit(e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none" />
                            <button onClick={() => saveBudget(cat.id)} className="bg-accent text-white text-[10px] font-black px-4 rounded-xl">OK</button>
                         </div>
                      ) : (
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                              <div className={`h-full rounded-full transition-all duration-1000 ${spent > limit && limit > 0 ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${limit > 0 ? percentage : Math.min(spent/10, 100)}%` }}></div>
                          </div>
                      )}
                   </div>
                );
             })}
          </div>
        </div>

        {!isPremium && (
          <div className="lg:col-span-2">
            <AdBanner className="my-4" />
          </div>
        )}

        {/* EVOLUÇÃO DIÁRIA */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest">{t('rep.daily')}</h3>
          <div className="h-72 w-full">
            {filteredTransactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="day" tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} axisLine={false} tickLine={false} interval={1} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff'}} />
                  <Bar dataKey="amount" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 font-bold opacity-50">{t('rep.no_data')}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

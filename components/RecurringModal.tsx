
import React, { useState, useEffect } from 'react';
import { RecurringTransaction, TransactionType, Account, CreditCard, Category } from '../types';
import { X, Calendar, DollarSign, FileText, Repeat, Trash2, Check, Plus, Crown, Lock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  recurringList: RecurringTransaction[];
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
  isPremium: boolean;
  onUpgrade: () => void;
}

const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  recurringList,
  accounts,
  cards,
  categories,
  isPremium,
  onUpgrade
}) => {
  const { t, fCurrency } = useLanguage();
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('5');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [useCard, setUseCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView('LIST');
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setDayOfMonth('5');
    setType(TransactionType.EXPENSE);
    setCategoryId('');
    setAccountId('');
    setCardId('');
    setUseCard(false);
  };

  const handleEditClick = (item: RecurringTransaction) => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setEditingId(item.id);
    setDescription(item.description);
    setAmount(item.amount.toString());
    setDayOfMonth(item.dayOfMonth.toString());
    setType(item.type);
    setCategoryId(item.categoryId);
    setAccountId(item.accountId || '');
    setCardId(item.cardId || '');
    setUseCard(!!item.cardId);
    setView('FORM');
  };

  const handleAddNew = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    resetForm();
    setView('FORM');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
        alert("Preencha descrição e valor.");
        return;
    }

    const payload: RecurringTransaction = {
      id: editingId || uuidv4(),
      description,
      amount: parseFloat(amount),
      dayOfMonth: parseInt(dayOfMonth),
      type,
      categoryId,
      accountId: !useCard ? accountId : undefined,
      cardId: useCard ? cardId : undefined,
      active: true
    };

    onSave(payload);
    setView('LIST');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {view === 'LIST' ? (
                <>
                    <Repeat size={20} className="text-indigo-600 dark:text-indigo-400" />
                    {t('nav.recurring')}
                </>
            ) : (
                'Editar Recorrência'
            )}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {view === 'LIST' && (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
                {!isPremium && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-b border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                             <Crown size={18} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-200 uppercase tracking-tight">Recurso Premium</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">Automatize seus lançamentos mensais. O app lança para você no dia certo.</p>
                            <button onClick={onUpgrade} className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-2 hover:underline uppercase">
                                Quero ser Premium
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {recurringList.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                            <Repeat size={48} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">{t('dash.no_transactions')}</p>
                        </div>
                    ) : (
                        recurringList.map(item => (
                            <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <span className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight">DIA</span>
                                        <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{item.dayOfMonth}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{item.description}</p>
                                        <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                                            {fCurrency(item.amount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                     <button 
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        {isPremium ? <FileText size={18} /> : <Lock size={16} />}
                                    </button>
                                    {isPremium && (
                                        <button 
                                            onClick={() => onDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                    <button 
                        onClick={handleAddNew}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isPremium ? <Plus size={18} /> : <Lock size={16} />}
                        <span>Nova Conta Fixa</span>
                    </button>
                </div>
            </div>
        )}

        {view === 'FORM' && (
             <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900 transition-colors">
                
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                    <button
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                        type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    >
                    {t('dash.expense')}
                    </button>
                    <button
                    type="button"
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                        type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    >
                    {t('dash.income')}
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('mod.desc')}</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white"
                        placeholder="Ex: Aluguel"
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('mod.amount')}</label>
                        <div className="relative">
                            <span className="absolute left-3 top-4 text-slate-400 text-sm font-bold">{fCurrency(0).replace(/[0-9,\s]/g, '')}</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-9 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white font-bold"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dia do Mês</label>
                        <select 
                            value={dayOfMonth} 
                            onChange={(e) => setDayOfMonth(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white font-bold appearance-none"
                        >
                            {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('mod.cat')}</label>
                    <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white appearance-none font-bold"
                    >
                    <option value="">{t('mod.cat')}</option>
                    {categories.filter(c => c.type === type).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                </div>

                 {type === TransactionType.EXPENSE && (
                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                        <input 
                        type="checkbox" 
                        id="useCardRecur" 
                        checked={useCard} 
                        onChange={(e) => setUseCard(e.target.checked)}
                        className="w-5 h-5 text-slate-900 dark:text-white rounded-lg focus:ring-0"
                        />
                        <label htmlFor="useCardRecur" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('mod.use_card')}</label>
                    </div>

                    {useCard ? (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('nav.cards')}</label>
                            <select
                            value={cardId}
                            onChange={(e) => setCardId(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-bold"
                            >
                            <option value="">{t('nav.cards')}</option>
                            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('mod.acc_pay')}</label>
                            <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-bold"
                            >
                            <option value="">{t('mod.acc_pay')}</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    )}
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={() => setView('LIST')}
                        className="flex-1 py-4 text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Voltar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        {t('mod.save')}
                    </button>
                </div>
             </form>
        )}

      </div>
    </div>
  );
};

export default RecurringModal;

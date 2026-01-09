
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account, CreditCard, Category } from '../types';
import { X, Calendar, DollarSign, FileText, Trash2, Zap, CreditCard as CardIcon, Wallet, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, 'id'> | Transaction) => void;
  onDelete?: (id: string) => void;
  onAddCategory?: () => void;
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
  initialData?: Transaction | null;
  isPremium?: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onAddCategory,
  accounts,
  cards,
  categories,
  initialData,
  isPremium = false
}) => {
  const { t, fCurrency } = useLanguage();
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amountString, setAmountString] = useState('');
  const [rawValue, setRawValue] = useState(0);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [installments, setInstallments] = useState(1);
  const [useCard, setUseCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setRawValue(initialData.amount);
        setAmountString(fCurrency(initialData.amount));
        setDescription(initialData.description);
        setDate(initialData.date);
        setCategoryId(initialData.categoryId);
        if (initialData.cardId) {
            setUseCard(true);
            setCardId(initialData.cardId);
            setAccountId('');
        } else {
            setUseCard(false);
            setAccountId(initialData.accountId || '');
            setCardId('');
        }
        setIsPaid(initialData.isPaid);
        setInstallments(initialData.installmentTotal || 1);
      } else {
        setAmountString('');
        setRawValue(0);
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setInstallments(1);
        setUseCard(false);
        setIsPaid(true);
        setAccountId('');
        setCardId('');
        setCategoryId('');
        setType(TransactionType.EXPENSE);
      }
    }
  }, [isOpen, initialData, fCurrency]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    const floatValue = Number(value) / 100;
    setRawValue(floatValue);
    setAmountString(fCurrency(floatValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawValue <= 0) return alert("Valor inválido");
    if (!description.trim()) return alert("Descrição necessária");

    const payload: any = {
      description,
      amount: rawValue,
      date,
      type,
      categoryId, 
      accountId: (type === TransactionType.INCOME || !useCard) ? accountId : undefined,
      cardId: (type === TransactionType.EXPENSE && useCard) ? cardId : undefined,
      isPaid: (type === TransactionType.EXPENSE && useCard) ? false : isPaid, 
      installmentTotal: (type === TransactionType.EXPENSE && useCard && installments > 1) ? installments : undefined,
    };

    if (initialData) payload.id = initialData.id;
    onSave(payload);
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete && window.confirm(t('mod.confirm_del'))) {
        onDelete(initialData.id);
        onClose();
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            {initialData ? t('mod.edit_tx') : t('mod.new_tx')}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem]">
            <button
              type="button"
              onClick={() => { setType(TransactionType.EXPENSE); setCategoryId(''); }}
              className={`flex-1 py-3 text-sm font-black rounded-2xl transition-all ${
                type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t('dash.expense').toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => { setType(TransactionType.INCOME); setUseCard(false); setCategoryId(''); }}
              className={`flex-1 py-3 text-sm font-black rounded-2xl transition-all ${
                type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t('dash.income').toUpperCase()}
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('mod.amount')}</label>
            <input
              type="text"
              inputMode="numeric"
              value={amountString}
              onChange={handleAmountChange}
              className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl focus:outline-none focus:ring-4 focus:ring-accent/10 text-4xl font-black text-slate-800 dark:text-white transition-all"
              placeholder={fCurrency(0)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('mod.desc')}</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-bold"
                placeholder="Ex: Aluguel, Supermercado..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('mod.cat')}</label>
                    {isPremium && onAddCategory && (
                        <button 
                            type="button" 
                            onClick={onAddCategory}
                            className="text-[10px] font-black text-accent flex items-center gap-1 hover:underline"
                        >
                            <Plus size={10} /> NOVA
                        </button>
                    )}
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white appearance-none font-black"
                >
                  <option value="">{t('mod.cat')}</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('mod.date')}</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-black"
                />
              </div>
          </div>

          <div className="pt-6 border-t dark:border-slate-800">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">FORMA DE PAGAMENTO</label>
             
             <div className="grid grid-cols-2 gap-4">
                <button 
                    type="button" 
                    onClick={() => { setUseCard(false); setIsPaid(true); }}
                    className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${!useCard ? 'border-accent bg-accent text-white shadow-xl' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                >
                    <Wallet size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">PIX / Débito</span>
                </button>

                {type === TransactionType.EXPENSE && (
                  <button 
                      type="button" 
                      onClick={() => { setUseCard(true); setIsPaid(false); }}
                      className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${useCard ? 'border-accent bg-accent text-white shadow-xl' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                  >
                      <CardIcon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Cartão de Crédito</span>
                  </button>
                )}
             </div>

             <div className="mt-6 animate-in slide-in-from-top-4 duration-500">
                {useCard ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Qual Cartão?</label>
                            <select
                              value={cardId}
                              onChange={(e) => setCardId(e.target.value)}
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-black appearance-none"
                            >
                              <option value="">Selecionar Cartão</option>
                              {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Parcelas</label>
                            <select 
                                value={installments} 
                                onChange={(e) => setInstallments(parseInt(e.target.value))}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-black appearance-none"
                            >
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{type === TransactionType.INCOME ? t('mod.acc_dest').toUpperCase() : t('mod.acc_pay').toUpperCase()}</label>
                        <select
                          value={accountId}
                          onChange={(e) => setAccountId(e.target.value)}
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none dark:text-white font-black appearance-none"
                        >
                          <option value="">Selecionar Conta</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                )}
             </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
          {initialData && (
             <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-4 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all hover:scale-105"
              >
                <Trash2 size={24} />
              </button>
          )}
          <button
            type="submit"
            className="flex-1 py-4 bg-accent text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg"
          >
            {initialData ? t('mod.update') : t('mod.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionModal;

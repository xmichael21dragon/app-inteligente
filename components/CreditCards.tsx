
import { dataService } from '../services/store';
import React, { useState } from 'react';
import { CreditCard, Transaction, Account, AccountType, UserSettings } from '../types';
import { CreditCard as CardIcon, Plus, Pencil, Check, X, Crown, Lock, BellRing, AlertTriangle } from 'lucide-react';
import CardModal from './CardModal';
import { useLanguage } from '../contexts/LanguageContext';

interface CreditCardsProps {
  cards: CreditCard[];
  transactions: Transaction[];
  accounts: Account[]; 
  onSaveCard: (card: CreditCard) => void;
  onDeleteCard: (cardId: string) => void;
  onRefreshData?: () => void; 
  isPremium?: boolean;
  onUpgrade?: () => void;
  currentMonthDate: Date;
  settings?: UserSettings;
}

const CreditCards: React.FC<CreditCardsProps> = ({ 
  cards, 
  transactions, 
  accounts, 
  onSaveCard, 
  onDeleteCard, 
  onRefreshData,
  isPremium = false,
  onUpgrade,
  currentMonthDate,
  settings = { notifyClosingDays: 3, notifyDueDays: 5 }
}) => {
  const { t, locale, fCurrency } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [payingCardId, setPayingCardId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const month = currentMonthDate.getMonth();
  const year = currentMonthDate.getFullYear();

  const getCardDetails = (card: CreditCard) => {
    // Filtrar transações APENAS do mês selecionado
    const cardTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return tx.cardId === card.id && 
               !tx.isPaid && 
               txDate.getMonth() === month && 
               txDate.getFullYear() === year;
    });

    const invoiceTotal = cardTransactions.reduce((acc, t) => acc + t.amount, 0);
    const available = card.limitTotal - invoiceTotal;
    const sortedTransactions = [...cardTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Lógica de Alerta de Fechamento/Vencimento
    const today = new Date();
    const currentDay = today.getDate();
    
    const isCloseToClosing = Math.abs(card.closingDay - currentDay) <= settings.notifyClosingDays;
    const isCloseToDue = Math.abs(card.dueDay - currentDay) <= settings.notifyDueDays;

    return { invoiceTotal, available, sortedTransactions, isCloseToClosing, isCloseToDue };
  };

  const handleEditClick = (card: CreditCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleNewCardClick = () => {
    if (!isPremium && cards.length >= 2) {
      if (onUpgrade) onUpgrade();
      return;
    }
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handlePayInvoice = async (card: CreditCard, amount: number) => {
    if (!selectedAccountId) {
        alert("Por favor, selecione uma conta para realizar o pagamento.");
        return;
    }

    setIsProcessing(true);
    const success = await dataService.payCardInvoice(card.id, selectedAccountId, amount, card.name, currentMonthDate);
    setIsProcessing(false);

    if (success) {
        setPayingCardId(null);
        setSelectedAccountId('');
        if (onRefreshData) onRefreshData();
    } else {
        alert("Erro ao processar pagamento. Tente novamente.");
    }
  };

  const reachedLimit = !isPremium && cards.length >= 2;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('cards.title')}</h2>
            {!isPremium && (
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-1">Plano Free: {cards.length}/2 Cartões</p>
            )}
        </div>
        <button 
          onClick={handleNewCardClick}
          className={`flex items-center space-x-2 text-sm font-bold px-6 py-4 rounded-2xl shadow-xl transition-all ${reachedLimit ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-105'}`}
        >
          {reachedLimit ? <Crown size={18} fill="currentColor" /> : <Plus size={18} />}
          <span>{reachedLimit ? 'Upgrade' : t('cards.new')}</span>
        </button>
      </div>

      {cards.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <CardIcon size={64} className="mx-auto text-slate-300 mb-6 opacity-20" />
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t('dash.no_cards')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.map(card => {
          const { invoiceTotal, available, sortedTransactions, isCloseToClosing, isCloseToDue } = getCardDetails(card);
          const isPayingThis = payingCardId === card.id;

          return (
            <div key={card.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all">
              <div className={`p-8 text-white ${card.color} relative overflow-hidden transition-colors`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                <button onClick={() => handleEditClick(card)} className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-all z-10"><Pencil size={18} /></button>
                
                {(isCloseToClosing || isCloseToDue) && (
                   <div className="absolute top-6 left-6 z-10 animate-pulse bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md border border-white/20">
                      <BellRing size={14} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Aviso de Data</span>
                   </div>
                )}

                <div className="flex justify-between items-start mb-10 mt-6 relative z-10">
                  <CardIcon size={32} className="opacity-90" />
                  <span className="text-sm font-mono opacity-80 tracking-[0.3em]">•••• 1234</span>
                </div>
                <h3 className="text-2xl font-black mb-6 relative z-10 truncate">{card.name}</h3>
                <div className="flex justify-between items-end relative z-10">
                   <div>
                      <p className="text-[10px] uppercase font-bold opacity-70 mb-1 tracking-widest">{t('cards.available')}</p>
                      <p className="text-2xl font-black">{fCurrency(available)}</p>
                   </div>
                   <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-tighter ${isCloseToClosing ? 'bg-white text-slate-900 px-2 py-0.5 rounded' : 'opacity-90'}`}>FECHA DIA {card.closingDay}</p>
                      <p className={`text-[10px] font-black uppercase tracking-tighter mt-1 ${isCloseToDue ? 'bg-red-500 text-white px-2 py-0.5 rounded' : 'opacity-90'}`}>VENCE DIA {card.dueDay}</p>
                   </div>
                </div>
              </div>

              <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {!isPayingThis ? (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fatura do Mês</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{fCurrency(invoiceTotal)}</p>
                        </div>
                        {invoiceTotal > 0 && (
                            <button 
                                onClick={() => setPayingCardId(card.id)}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                {t('cards.pay')}
                            </button>
                        )}
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagar fatura do mês de {currentMonthDate.toLocaleDateString(locale, {month: 'long'})}?</span>
                            <button onClick={() => setPayingCardId(null)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                        </div>
                        <div className="flex gap-2">
                            <select 
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                <option value="">Selecionar Conta</option>
                                {accounts.filter(a => a.type === AccountType.BANK || a.type === AccountType.WALLET).map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({fCurrency(acc.currentBalance)})</option>
                                ))}
                            </select>
                            <button 
                                onClick={() => handlePayInvoice(card, invoiceTotal)}
                                disabled={isProcessing || !selectedAccountId}
                                className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 shadow-md transition-all"
                            >
                                {isProcessing ? "..." : <Check size={18} />}
                            </button>
                        </div>
                    </div>
                  )}
              </div>

              <div className="p-4 flex-1">
                  <div className="flex items-center justify-between px-4 mb-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lançamentos do Mês</h4>
                    {isCloseToDue && invoiceTotal > 0 && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase animate-pulse">
                            <AlertTriangle size={10} /> Vencimento Próximo
                        </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {sortedTransactions.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{t.description}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {new Date(t.date).toLocaleDateString(locale)}
                                    {t.installmentTotal && t.installmentTotal > 1 ? ` • ${t.installmentCurrent}/${t.installmentTotal}` : ''}
                                </span>
                            </div>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">{fCurrency(t.amount)}</span>
                        </div>
                    ))}
                    {sortedTransactions.length === 0 && (
                        <div className="p-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            {t('cards.no_purchases')}
                        </div>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      <CardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSaveCard} onDelete={onDeleteCard} initialData={editingCard} />
    </div>
  );
};

export default CreditCards;

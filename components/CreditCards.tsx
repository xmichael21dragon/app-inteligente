
import React, { useState } from 'react';
import { CreditCard, Transaction, Account, AccountType } from '../types';
import { CreditCard as CardIcon, Plus, Pencil, Check, X, Crown, Lock } from 'lucide-react';
import CardModal from './CardModal';
import { useLanguage } from '../contexts/LanguageContext';
import { dataService } from '../services/store';

interface CreditCardsProps {
  cards: CreditCard[];
  transactions: Transaction[];
  accounts: Account[]; // Adicionado para permitir escolher conta de pagamento
  onSaveCard: (card: CreditCard) => void;
  onDeleteCard: (cardId: string) => void;
  onRefreshData?: () => void; // Callback para atualizar os dados após pagamento
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const CreditCards: React.FC<CreditCardsProps> = ({ 
  cards, 
  transactions, 
  accounts, 
  onSaveCard, 
  onDeleteCard, 
  onRefreshData,
  isPremium = false,
  onUpgrade
}) => {
  const { t, locale, fCurrency } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [payingCardId, setPayingCardId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getCardDetails = (card: CreditCard) => {
    const cardTransactions = transactions.filter(t => t.cardId === card.id && !t.isPaid);
    const invoiceTotal = cardTransactions.reduce((acc, t) => acc + t.amount, 0);
    const available = card.limitTotal - invoiceTotal;
    const sortedTransactions = [...cardTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { invoiceTotal, available, sortedTransactions };
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
    const success = await dataService.payCardInvoice(card.id, selectedAccountId, amount, card.name);
    setIsProcessing(false);

    if (success) {
        setPayingCardId(null);
        setSelectedAccountId('');
        if (onRefreshData) onRefreshData();
        else window.location.reload(); // Fallback caso não haja callback
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

      {reachedLimit && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600">
                <Lock size={20} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Limite atingido no Plano Free</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Usuários gratuitos podem cadastrar até 2 cartões. Seja PRO para ilimitados.</p>
            </div>
            <button onClick={onUpgrade} className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-colors">Ver Planos</button>
        </div>
      )}

      {cards.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <CardIcon size={64} className="mx-auto text-slate-300 mb-6 opacity-20" />
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{t('dash.no_cards')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.map(card => {
          const { invoiceTotal, available, sortedTransactions } = getCardDetails(card);
          const isPayingThis = payingCardId === card.id;

          return (
            <div key={card.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all">
              <div className={`p-8 text-white ${card.color} relative overflow-hidden transition-colors`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                <button onClick={() => handleEditClick(card)} className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-all z-10"><Pencil size={18} /></button>
                <div className="flex justify-between items-start mb-10 relative z-10">
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
                      <p className="text-[10px] opacity-90 font-black uppercase tracking-tighter">FECHA DIA {card.closingDay}</p>
                      <p className="text-[10px] opacity-90 font-black uppercase tracking-tighter">VENCE DIA {card.dueDay}</p>
                   </div>
                </div>
              </div>

              <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {!isPayingThis ? (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('cards.invoice')}</p>
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
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagar de qual conta?</span>
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
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Últimos Lançamentos</h4>
                  <div className="space-y-1">
                    {sortedTransactions.slice(0, 4).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{t.description}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                    {new Date(t.date).toLocaleDateString(locale)}
                                    {t.installmentTotal ? ` • ${t.installmentCurrent}/${t.installmentTotal}` : ''}
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

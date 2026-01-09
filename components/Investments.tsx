
import React, { useState } from 'react';
import { Account, AccountType } from '../types';
import { PiggyBank, TrendingUp, Plus, Pencil, QrCode, Copy, Check, Building2, Wallet } from 'lucide-react';
import AccountModal from './AccountModal';
import { useLanguage } from '../contexts/LanguageContext';

interface InvestmentsProps {
  accounts: Account[];
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
}

const Investments: React.FC<InvestmentsProps> = ({ accounts, onSaveAccount, onDeleteAccount }) => {
  const { t, fCurrency } = useLanguage();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const savingsAccounts = accounts.filter(a => a.type === AccountType.SAVINGS || a.type === AccountType.INVESTMENT || a.type === AccountType.BANK);
  const totalInvested = savingsAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  const handleCopyPix = (e: React.MouseEvent, pix: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(pix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.INVESTMENT: return TrendingUp;
      case AccountType.BANK: return Building2;
      case AccountType.WALLET: return Wallet;
      default: return PiggyBank;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('inv.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('inv.desc')}</p>
        </div>
        <button 
            onClick={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
            className="flex items-center justify-center space-x-2 text-sm font-black text-white bg-teal-600 px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
            <Plus size={20} />
            <span>Adicionar Conta</span>
        </button>
      </div>

      {/* BANNER DE TOTAL */}
      <div className="bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4 opacity-90 relative z-10">
              <PiggyBank size={24} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">{t('inv.total')}</span>
          </div>
          <h3 className="text-5xl font-black relative z-10">{fCurrency(totalInvested)}</h3>
          <div className="mt-8 flex gap-4 relative z-10">
             <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
                {accounts.length} Contas Ativas
             </div>
          </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">{t('inv.my_accounts')}</h3>
        {savingsAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savingsAccounts.map(acc => {
              const Icon = getAccountIcon(acc.type);
              return (
                <div 
                  key={acc.id} 
                  onClick={() => { setEditingAccount(acc); setIsAccountModalOpen(true); }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6 ${acc.color.replace('text-', 'bg-')}`}>
                         <Icon size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-lg truncate">{acc.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">
                           {acc.type === AccountType.INVESTMENT ? 'Investimento' : acc.type === AccountType.BANK ? 'Conta Corrente' : 'Cofrinho'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Saldo Atual</p>
                      <p className="font-black text-slate-800 dark:text-white text-2xl">{fCurrency(acc.currentBalance)}</p>
                  </div>

                  {acc.pixKey && (
                    <div className="pt-4 border-t dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 min-w-0">
                         <QrCode size={14} className="shrink-0" />
                         <span className="text-[10px] font-bold uppercase tracking-widest truncate">{acc.pixKey}</span>
                      </div>
                      <button 
                         onClick={(e) => handleCopyPix(e, acc.pixKey!, acc.id)}
                         className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm ${copiedId === acc.id ? 'bg-green-100 text-green-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                       >
                         {copiedId === acc.id ? <Check size={12} /> : <Copy size={12} />}
                         {copiedId === acc.id ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 py-24 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <PiggyBank size={64} className="mx-auto text-slate-200 mb-6 opacity-20" />
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">{t('inv.no_safes')}</p>
            <button onClick={() => { setEditingAccount(null); setIsAccountModalOpen(true); }} className="mt-6 text-teal-600 font-black text-sm uppercase tracking-widest hover:underline">{t('inv.start')}</button>
          </div>
        )}
      </div>

      <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSave={onSaveAccount} onDelete={onDeleteAccount} initialData={editingAccount} />
    </div>
  );
};

export default Investments;

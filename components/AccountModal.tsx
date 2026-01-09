
import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import { X, Check, Wallet, PiggyBank, Building2, TrendingUp, QrCode } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  onDelete?: (accountId: string) => void;
  initialData?: Account | null;
}

const COLORS = [
  'bg-slate-800', 
  'bg-red-600', 
  'bg-orange-600', 
  'bg-amber-600',
  'bg-green-600', 
  'bg-emerald-600', 
  'bg-teal-600', 
  'bg-cyan-600',
  'bg-blue-600', 
  'bg-indigo-600', 
  'bg-violet-600', 
  'bg-purple-600',
  'bg-fuchsia-600', 
  'bg-pink-600', 
  'bg-rose-600'
];

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.BANK);
  const [initialBalance, setInitialBalance] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setInitialBalance(initialData.initialBalance.toString());
        setPixKey(initialData.pixKey || '');
        setColor(initialData.color);
      } else {
        setName('');
        setType(AccountType.BANK);
        setInitialBalance('');
        setPixKey('');
        setColor(COLORS[0]);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Por favor, digite o nome da conta.");
        return;
    }

    const balanceValue = initialBalance ? parseFloat(initialBalance) : 0;

    onSave({
      id: initialData ? initialData.id : '',
      name,
      type,
      initialBalance: balanceValue,
      currentBalance: balanceValue,
      color,
      pixKey: pixKey.trim() || undefined
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete && window.confirm('Tem certeza que deseja excluir esta conta? As transações vinculadas podem ficar inconsistentes.')) {
      onDelete(initialData.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (t: AccountType) => {
    switch (t) {
      case AccountType.BANK: return Building2;
      case AccountType.WALLET: return Wallet;
      case AccountType.SAVINGS: return PiggyBank;
      case AccountType.INVESTMENT: return TrendingUp;
      default: return Wallet;
    }
  };

  const getTypeLabel = (t: AccountType) => {
    switch (t) {
      case AccountType.BANK: return 'Conta Corrente';
      case AccountType.WALLET: return 'Carteira Manual';
      case AccountType.SAVINGS: return 'Poupança / Cofrinho';
      case AccountType.INVESTMENT: return 'Investimentos';
      default: return t;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {initialData ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
          
          {/* Preview Card */}
          <div className={`w-full h-32 rounded-xl ${color} p-6 text-white shadow-lg transition-colors duration-300 relative overflow-hidden flex flex-col justify-between`}>
             <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-5 -mt-5 blur-xl"></div>
             <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        {React.createElement(getTypeIcon(type), { size: 24 })}
                    </div>
                    <span className="text-xs font-medium opacity-90 tracking-wide uppercase">{getTypeLabel(type)}</span>
                </div>
             </div>
             <div className="relative z-10">
                <p className="text-lg font-bold truncate">{name || 'Nome da Conta'}</p>
                <p className="text-sm opacity-80">
                   {pixKey ? `PIX: ${pixKey}` : `Saldo Inicial: R$ ${initialBalance || '0,00'}`}
                </p>
             </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome da Conta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white"
              placeholder="Ex: Nubank, Carteira..."
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Conta</label>
             <div className="grid grid-cols-2 gap-2">
                {[AccountType.BANK, AccountType.WALLET, AccountType.SAVINGS, AccountType.INVESTMENT].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex flex-col items-start gap-2 ${
                            type === t 
                            ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        {React.createElement(getTypeIcon(t), { size: 18 })}
                        {getTypeLabel(t)}
                    </button>
                ))}
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chave PIX (Opcional)</label>
            <div className="relative">
              <QrCode className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                placeholder="CPF, E-mail, Celular..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saldo Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cor da Etiqueta</label>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full ${c} flex items-center justify-center transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                >
                  {color === c && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg active:scale-95 transition-all"
            >
              Salvar Conta
            </button>
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                Excluir Conta
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;

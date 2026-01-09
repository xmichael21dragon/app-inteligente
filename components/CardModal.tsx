
import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { X, Check, CreditCard as CardIcon } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CreditCard) => void;
  onDelete?: (cardId: string) => void;
  initialData?: CreditCard | null;
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

const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [name, setName] = useState('');
  const [limitTotal, setLimitTotal] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setLimitTotal(initialData.limitTotal.toString());
        setClosingDay(initialData.closingDay.toString());
        setDueDay(initialData.dueDay.toString());
        setColor(initialData.color);
      } else {
        setName('');
        setLimitTotal('');
        setClosingDay('');
        setDueDay('');
        setColor(COLORS[0]);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
        alert("Por favor, digite o nome do cartão.");
        return;
    }
    if (!limitTotal) {
        alert("Por favor, digite o limite total.");
        return;
    }
    if (!closingDay || !dueDay) {
        alert("Por favor, preencha os dias de fechamento e vencimento.");
        return;
    }

    onSave({
      id: initialData ? initialData.id : '',
      name,
      limitTotal: parseFloat(limitTotal),
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      color
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete && window.confirm('Tem certeza que deseja excluir este cartão?')) {
      onDelete(initialData.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {initialData ? 'Editar Cartão' : 'Novo Cartão'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
          
          {/* Preview Card */}
          <div className={`w-full h-40 rounded-xl ${color} p-6 text-white shadow-lg transition-colors duration-300 relative overflow-hidden`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="flex justify-between items-start mb-6 relative z-10">
                <CardIcon size={24} className="opacity-80" />
                <span className="text-xs font-mono opacity-80">•••• 1234</span>
             </div>
             <div className="relative z-10">
                <p className="text-lg font-bold truncate">{name || 'Nome do Cartão'}</p>
                <div className="flex justify-between items-end mt-4">
                    <div>
                        <p className="text-xs opacity-70 uppercase font-bold">Limite</p>
                        <p className="font-bold">
                           {limitTotal ? `R$ ${parseFloat(limitTotal).toLocaleString('pt-BR')}` : 'R$ 0,00'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Fecha dia {closingDay || 'DD'}</p>
                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Vence dia {dueDay || 'DD'}</p>
                    </div>
                </div>
             </div>
          </div>

          {/* Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Cartão</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white"
              placeholder="Ex: Nubank"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Limite Total (R$)</label>
            <input
              type="number"
              step="0.01"
              value={limitTotal}
              onChange={(e) => setLimitTotal(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white"
              placeholder="0,00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dia Fechamento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white"
                placeholder="Ex: 5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dia Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 dark:focus:ring-white/5 dark:text-white"
                placeholder="Ex: 12"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cor do Cartão</label>
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
              Salvar Cartão
            </button>
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                Excluir Cartão
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;


import React, { useState, useEffect } from 'react';
import { Category, TransactionType } from '../types';
import { X, Check, Layers, ShoppingBag, Utensils, Car, Heart, Home, GraduationCap, Plane, Coffee, Gift, Dumbbell, Wrench, Briefcase, Camera, Music, Tv, Smartphone, Globe } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Category) => void;
  initialData?: Category | null;
}

const COLORS = [
  'bg-slate-800', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500'
];

const ICONS = [
  { name: 'Layers', icon: Layers },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Utensils', icon: Utensils },
  { name: 'Car', icon: Car },
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Plane', icon: Plane },
  { name: 'Coffee', icon: Coffee },
  { name: 'Gift', icon: Gift },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Wrench', icon: Wrench },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Camera', icon: Camera },
  { name: 'Music', icon: Music },
  { name: 'Tv', icon: Tv },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Globe', icon: Globe },
];

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [color, setColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('Layers');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setColor(initialData.color);
        setSelectedIcon(initialData.icon || 'Layers');
      } else {
        setName('');
        setType(TransactionType.EXPENSE);
        setColor(COLORS[0]);
        setSelectedIcon('Layers');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Dê um nome à categoria");
    
    onSave({
      id: initialData?.id || '',
      name,
      type,
      color,
      icon: selectedIcon
    });
    onClose();
  };

  if (!isOpen) return null;

  const ActiveIcon = ICONS.find(i => i.name === selectedIcon)?.icon || Layers;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${color} text-white`}>
               <ActiveIcon size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              {initialData ? 'Editar Categoria' : 'Nova Categoria Pro'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className="flex justify-center mb-2">
             <div className={`w-24 h-24 ${color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 transition-all duration-500 scale-105`}>
                <ActiveIcon size={40} />
             </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Categoria</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 dark:text-white font-bold transition-all"
                placeholder="Ex: Assinaturas, Streaming..."
                autoFocus
              />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setType(TransactionType.EXPENSE)}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500'}`}
              >
                DESPESA
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.INCOME)}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-green-500 shadow-sm' : 'text-slate-500'}`}
              >
                RECEITA
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Escolha um Ícone</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${selectedIcon === item.name ? 'border-accent bg-accent/10 text-accent scale-110 shadow-md' : 'border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <item.icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Escolha uma Cor</label>
              <div className="grid grid-cols-5 gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-full aspect-square rounded-xl ${c} flex items-center justify-center transition-all hover:scale-110 ${color === c ? 'ring-4 ring-offset-2 ring-accent scale-110 shadow-lg' : ''}`}
                  >
                    {color === c && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 bg-accent text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-lg"
          >
            {initialData ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA PRO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;

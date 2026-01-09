
import React, { useState } from 'react';
import { supabase } from '../services/store';
import { Eye, EyeOff } from 'lucide-react';
import SmartLogo from './SmartLogo';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) alert(error.message);
      else alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4 transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex justify-center mb-8 group cursor-default">
           <SmartLogo size="lg" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white text-center mb-2 tracking-tight">Carteira Inteligente</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-10 font-medium">Suas finanças em um novo patamar.</p>
        
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-accent/10 outline-none shadow-sm transition-all font-bold"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-accent/10 outline-none shadow-sm transition-all font-bold"
                placeholder="******"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-accent transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-white font-black rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl shadow-accent/20 border border-white/10 uppercase tracking-widest text-sm mt-4"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar Agora')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-accent transition-colors font-black uppercase tracking-widest"
          >
            {isSignUp ? 'Já tenho uma conta → Login' : 'Novo por aqui? → Cadastrar'}
          </button>
        </div>
      </div>
      <p className="mt-10 text-[10px] text-slate-400 uppercase tracking-[0.5em] font-black opacity-30">Powered by Carteira Inteligente</p>
    </div>
  );
};

export default Auth;

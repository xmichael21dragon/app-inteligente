
import React, { useState } from 'react';
import { X, CheckCircle2, Zap, Crown, Download, Target, Repeat, CreditCard, QrCode, Copy, Check, ExternalLink, ShieldAlert, Clock } from 'lucide-react';
import { PAYMENT_CONFIG, dataService } from '../services/store';
import { useLanguage } from '../contexts/LanguageContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

type CheckoutStep = 'BENEFITS' | 'METHOD' | 'PIX_DETAIL' | 'VERIFYING' | 'SUCCESS';

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<CheckoutStep>('BENEFITS');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixId, setPixId] = useState('');

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenCheckout = () => {
    window.open(PAYMENT_CONFIG.checkoutLink, '_blank');
    setStep('VERIFYING'); // No checkout externo também pedimos verificação
  };

  const handleConfirmPix = async () => {
    if (!pixId.trim()) {
      alert("Por favor, insira o ID da transação (ID E2E) que aparece no seu comprovante.");
      return;
    }
    setLoading(true);
    const success = await dataService.requestActivation(pixId);
    setLoading(false);
    
    if (success) {
      setStep('VERIFYING');
    } else {
      alert("Ocorreu um erro ao enviar sua solicitação. Tente novamente ou contate o suporte.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] transition-colors">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 dark:hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        {step === 'BENEFITS' && (
          <>
            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-8 pt-12 text-white text-center relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/30">
                    <Crown size={32} className="text-white drop-shadow-md" fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Seja Carteira PRO</h2>
                <p className="text-amber-100 text-sm font-medium">Controle total, sem anúncios.</p>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0"><Repeat size={20} /></div>
                  <div><h4 className="font-bold text-slate-800 dark:text-white text-sm">Contas Fixas Automáticas</h4><p className="text-xs text-slate-500 dark:text-slate-400">Lançamentos que se repetem todo mês.</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0"><Target size={20} /></div>
                  <div><h4 className="font-bold text-slate-800 dark:text-white text-sm">Metas de Orçamento</h4><p className="text-xs text-slate-500 dark:text-slate-400">Alertas quando você gasta demais.</p></div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg shrink-0"><Zap size={20} /></div>
                  <div><h4 className="font-bold text-slate-800 dark:text-white text-sm">Zero Publicidade</h4><p className="text-xs text-slate-500 dark:text-slate-400">App limpo e 2x mais rápido.</p></div>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Plano Vitalício</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{t('premium.price')}</span>
               </div>
               <button 
                 onClick={() => setStep('METHOD')}
                 className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
               >
                 Quero ser PRO
               </button>
            </div>
          </>
        )}

        {step === 'METHOD' && (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Escolha como pagar</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sua segurança em primeiro lugar.</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setStep('PIX_DETAIL')}
                className="w-full p-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-teal-500 dark:hover:border-teal-500 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <QrCode size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 dark:text-white">PIX</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Liberação manual (até 24h)</p>
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-slate-200 dark:text-slate-800" />
              </button>

              <button 
                onClick={handleOpenCheckout}
                className="w-full p-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <CreditCard size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 dark:text-white">Cartão de Crédito</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Checkout externo</p>
                  </div>
                </div>
                <ExternalLink size={20} className="text-slate-200 dark:text-slate-800" />
              </button>
            </div>

            <button onClick={() => setStep('BENEFITS')} className="w-full py-2 text-slate-400 dark:text-slate-500 text-sm font-bold hover:text-slate-600 dark:hover:text-slate-300">Voltar</button>
          </div>
        )}

        {step === 'PIX_DETAIL' && (
          <div className="p-8 space-y-5 overflow-y-auto no-scrollbar">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <QrCode size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pague com PIX</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Copie a chave e pague no seu banco.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3">
              <code className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">{PAYMENT_CONFIG.pixKey}</code>
              <button 
                onClick={handleCopyPix}
                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-300'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">ID da Transação (comprovante)</label>
                <input 
                    type="text" 
                    value={pixId}
                    onChange={(e) => setPixId(e.target.value)}
                    placeholder="E2E123456789..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white text-xs font-mono"
                />
                <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                    <ShieldAlert size={14} />
                    <span>O código é essencial para validarmos seu pagamento.</span>
                </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleConfirmPix}
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Confirmar Pagamento"}
              </button>
              <button onClick={() => setStep('METHOD')} className="w-full py-2 text-slate-400 dark:text-slate-500 text-xs font-bold">Voltar</button>
            </div>
          </div>
        )}

        {step === 'VERIFYING' && (
          <div className="p-10 text-center space-y-6">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock size={48} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Verificação em Andamento</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Recebemos sua solicitação. Nossa equipe validará o pagamento em até **24 horas úteis**.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dúvidas?</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Envie o comprovante para: <br/><strong className="text-slate-800 dark:text-white">{PAYMENT_CONFIG.supportEmail}</strong></p>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-xl transition-all"
            >
              Entendido
            </button>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Pagamento Confirmado!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sua conta PRO já está ativa. Aproveite todos os recursos agora mesmo.</p>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-xl transition-all"
            >
              Começar a usar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PremiumModal;


import React, { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  minHeight?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  slot = "5942846961", 
  format = "horizontal",
  style = { display: 'block' },
  className = "",
  minHeight = "90px"
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const [status, setStatus] = useState<'loading' | 'filled' | 'unfilled' | 'error'>('loading');

  useEffect(() => {
    const initAd = () => {
      try {
        if (typeof window !== 'undefined') {
          const adsbygoogle = (window as any).adsbygoogle;
          if (adsbygoogle && adRef.current) {
            // Se o anúncio já foi processado, não empurrar novamente
            if (!adRef.current.getAttribute('data-adsbygoogle-status')) {
              adsbygoogle.push({});
            }
          }
        }
      } catch (e) {
        console.error("[AdSense] Erro ao carregar anúncio:", e);
        setStatus('error');
      }
    };

    // Delay para garantir que o DOM está pronto
    const timer = setTimeout(initAd, 800);

    // Observer para detectar se o Google preencheu o anúncio
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
          const newStatus = adRef.current?.getAttribute('data-ad-status') as any;
          if (newStatus === 'filled') setStatus('filled');
          if (newStatus === 'unfilled') setStatus('unfilled');
        }
      });
    });

    if (adRef.current) {
      observer.observe(adRef.current, { attributes: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [slot]);

  // Se o Google não retornar anúncio (site não aprovado ou sem inventário), 
  // mostramos um placeholder amigável em modo de desenvolvimento ou para manter o layout
  return (
    <div 
      className={`ad-container w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500 rounded-xl ${className} ${
        status === 'unfilled' ? 'opacity-50 grayscale' : 'opacity-100'
      }`}
      style={{ minHeight: minHeight }}
    >
      <div className="flex items-center gap-2 mb-2 opacity-20">
        <div className="h-[1px] w-4 bg-slate-400 dark:bg-slate-600"></div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-black">Publicidade</span>
        <div className="h-[1px] w-4 bg-slate-400 dark:bg-slate-600"></div>
      </div>
      
      {status === 'unfilled' && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2 animate-pulse">
          Aguardando aprovação do Google AdSense...
        </div>
      )}

      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ ...style, minWidth: '250px' }}
        data-ad-client="ca-pub-1966477514201373"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />

      <style>{`
        /* Garante que o container não colapse se o anúncio demorar */
        .adsbygoogle {
            min-height: 50px;
        }
        /* Oculta apenas se houver erro crítico */
        .adsbygoogle[data-ad-status="unfilled"] {
          min-height: 20px;
        }
      `}</style>
    </div>
  );
};

export default AdBanner;

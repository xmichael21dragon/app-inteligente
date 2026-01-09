
import React from 'react';

interface SmartLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SmartLogo: React.FC<SmartLogoProps> = ({ size = "md", className = "" }) => {
  const sizes = { 
    sm: "w-8 h-8", 
    md: "w-12 h-12", 
    lg: "w-28 h-28" 
  };
  
  return (
    <div className={`${sizes[size]} ${className} relative flex items-center justify-center group`}>
      {/* Efeito de brilho de fundo dinâmico */}
      <div className="absolute inset-0 bg-accent rounded-[30%] rotate-6 opacity-20 blur-[2px] transition-all duration-1000 group-hover:rotate-45 group-hover:scale-110"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full relative z-10 drop-shadow-2xl"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="walletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent, #6366f1)" />
            <stop offset="100%" stopColor="var(--color-accent, #6366f1)" stopOpacity="0.85" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Corpo da Carteira (Parte Traseira) */}
        <path 
          d="M15 35C15 31.6863 17.6863 29 21 29H79C82.3137 29 85 31.6863 85 35V71C85 74.3137 82.3137 77 79 77H21C17.6863 77 15 74.3137 15 71V35Z" 
          fill="url(#walletGradient)" 
        />
        
        {/* Aba Frontal da Carteira (Efeito de Profundidade) */}
        <path 
          d="M15 45C15 41.6863 17.6863 39 21 39H79C82.3137 39 85 41.6863 85 45V71C85 74.3137 82.3137 77 79 77H21C17.6863 77 15 74.3137 15 71V45Z" 
          fill="white" 
          fillOpacity="0.1" 
        />

        {/* Detalhe do Fecho / Chip Inteligente */}
        <rect x="65" y="48" width="20" height="14" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1" />
        <path d="M72 52L78 55L72 58" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Linha de Tendência Minimalista (Gastos Controlados) */}
        <path 
          d="M25 62L35 55L45 58L55 48L65 52" 
          stroke="white" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />
        
        {/* Reflexo de Vidro Superior */}
        <path 
          d="M20 35H80" 
          stroke="white" 
          strokeOpacity="0.2" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
};

export default SmartLogo;

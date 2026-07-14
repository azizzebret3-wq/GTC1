'use client';

import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group" passHref>
      <div className="relative">
        {/* Logo inspiré par l'image fournie */}
        <div className="w-12 h-12 relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
            {/* Cercle extérieur Navy */}
            <circle cx="50" cy="50" r="48" fill="white" stroke="#1D3557" strokeWidth="2.5"/>
            {/* Bordure intérieure Or */}
            <circle cx="50" cy="50" r="44" stroke="#D4AF37" strokeWidth="1.5"/>
            
            {/* Silhouette Humaine Navy */}
            <circle cx="50" cy="32" r="6" fill="#1D3557" />
            <path d="M50 40 C42 40 38 48 38 55 C38 62 42 68 50 72 C58 68 62 62 62 55 C62 48 58 40 50 40Z" fill="#1D3557" />
            
            {/* Livre Ouvert Or */}
            <path d="M25 60 C35 55 45 58 50 65 C55 58 65 55 75 60 L75 45 C65 40 55 43 50 50 C45 43 35 40 25 45 Z" fill="#D4AF37" />
            
            {/* Étoile de la réussite Or */}
            <path d="M58 22 L60 25.5 L64 26 L61 28 L62 32 L58 30.5 L54 32 L55 28 L52 26 L56 25.5 Z" fill="#D4AF37" className="animate-pulse" />
          </svg>
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#1D3557] dark:text-white tracking-tighter leading-none">
            INTÉGRALE
          </h1>
          <div className="flex items-center gap-1">
            <div className="h-[2px] w-2 bg-[#D4AF37]"></div>
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Formation</span>
            <div className="h-[2px] w-2 bg-[#D4AF37]"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
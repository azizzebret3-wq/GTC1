'use client';

import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 group" passHref>
      <div className="relative">
        {/* Logo réplique exacte de l'image fournie */}
        <div className="w-14 h-14 relative transition-transform duration-500 group-hover:scale-105">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
            {/* Bordures circulaires */}
            <circle cx="50" cy="50" r="49" fill="#1D3557" />
            <circle cx="50" cy="50" r="46" fill="#D4AF37" />
            <circle cx="50" cy="50" r="44" fill="#FDFCF0" />
            
            {/* Silhouette Humaine (Bleu) */}
            <circle cx="53" cy="27" r="5" fill="#1D3557" />
            <path d="M53 33 C46 33 42 40 43 48 C48 45 52 45 57 48 C58 40 54 33 53 33Z" fill="#1D3557" />
            <path d="M53 33 L62 20" stroke="#1D3557" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Étoile de la réussite (Or) */}
            <path d="M63 15 L65 18 L68 18.5 L66 20.5 L66.5 23.5 L63 22 L59.5 23.5 L60 20.5 L58 18.5 L61 18 Z" fill="#D4AF37" className="animate-pulse" />
            
            {/* Livre Ouvert (Or) */}
            <path d="M25 55 C35 50 45 53 50 60 C55 53 65 50 75 55 L75 40 C65 35 55 38 50 45 C45 38 35 35 25 40 Z" fill="#D4AF37" />
            <path d="M28 53 C38 48 45 51 50 56 C55 51 62 48 72 53" stroke="#1D3557" strokeWidth="1.5" fill="none" />
            
            {/* Texte INTÉGRALE */}
            <text x="50" y="70" textAnchor="middle" fill="#1D3557" style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'Arial Black' }}>INTÉGRALE</text>
            
            {/* Texte FORMATION avec lignes */}
            <line x1="18" y1="76" x2="30" y2="76" stroke="#D4AF37" strokeWidth="1" />
            <text x="50" y="79" textAnchor="middle" fill="#D4AF37" style={{ fontSize: '9px', fontWeight: '800', fontFamily: 'Arial' }}>FORMATION</text>
            <line x1="70" y1="76" x2="82" y2="76" stroke="#D4AF37" strokeWidth="1" />
            
            {/* Slogan et petit livre en bas */}
            <path d="M47 84 L50 86 L53 84 L53 82 L50 84 L47 82 Z" fill="#D4AF37" />
            <text x="50" y="94" textAnchor="middle" fill="#1D3557" style={{ fontSize: '5.5px', fontStyle: 'italic', fontWeight: '700' }}>La réussite dans son intégralité.</text>
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

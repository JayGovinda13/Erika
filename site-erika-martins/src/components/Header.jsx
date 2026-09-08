import React from 'react';
import logoHorizontal from '../assets/LOGO-HORIZONTAL-TRANSPARENTE.png';

export default function Header({ galerias }) {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-center py-6 px-8 md:px-16 border-b border-[#f5f5f5] sticky top-0 bg-white z-40">
      <div className="mb-6 lg:mb-0">
        <img 
          src={logoHorizontal} 
          alt="Erika Martins Artista" 
          className="h-12 md:h-16 w-auto" 
        />
      </div>
      
      <nav className="flex flex-wrap justify-center gap-6 lg:gap-8 text-xs md:text-sm uppercase tracking-widest text-[#616161]">
        <a href="#quem-sou" className="hover:text-black transition-colors">Quem Sou</a>
        {galerias.map(galeria => (
          <a key={galeria.id} href={`#${galeria.id}`} className="hover:text-black transition-colors">
            {galeria.titulo}
          </a>
        ))}
      </nav>
    </header>
  );
}
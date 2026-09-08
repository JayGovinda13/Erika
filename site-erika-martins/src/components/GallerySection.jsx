import React from 'react';
import { motion } from 'framer-motion';

export default function GallerySection({ galeria, onSelectImage }) {
  return (
    <section id={galeria.id} className="mb-24 pt-8 scroll-mt-32">
      <h2 className="text-lg md:text-xl text-[#616161] uppercase tracking-[0.2em] mb-8 border-b border-[#f5f5f5] pb-4">
        {galeria.titulo}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {galeria.obras.map((imagemSrc, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => onSelectImage(imagemSrc)}
            className="w-full aspect-square bg-[#f5f5f5] overflow-hidden group relative shadow-sm cursor-pointer"
          >
            <img 
              src={imagemSrc} 
              alt={`${galeria.titulo} - Obra ${index + 1}`} 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs uppercase tracking-widest bg-black/60 px-3 py-1">Ampliar</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
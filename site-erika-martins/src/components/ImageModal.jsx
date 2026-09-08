import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageModal({ selectedImage, onClose }) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Obra Ampliada" 
              className="max-h-[85vh] max-w-full object-contain mx-auto shadow-2xl"
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-black px-4 py-2 text-xs uppercase tracking-widest transition-colors rounded-none"
            >
              Fechar ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Header from './components/Header';
import GallerySection from './components/GallerySection';
import ImageModal from './components/ImageModal';

// 1. Esculturas de Cor
import img2694 from './assets/imagens/Esculturas de Cor/IMG_2694.JPG';
import img2695 from './assets/imagens/Esculturas de Cor/IMG_2695.JPG';
import img2696 from './assets/imagens/Esculturas de Cor/IMG_2696.JPG';

// 2. Expo Sawubona
import img9494_2 from './assets/imagens/Expo Sawubona/IMG_9494-2.JPG';
import img9494 from './assets/imagens/Expo Sawubona/IMG_9494.JPG';
import img9495_2 from './assets/imagens/Expo Sawubona/IMG_9495-2.JPG';
import img9495 from './assets/imagens/Expo Sawubona/IMG_9495.JPG';
import img9522_2 from './assets/imagens/Expo Sawubona/IMG_9522-2.JPG';
import img9524 from './assets/imagens/Expo Sawubona/IMG_9524.JPG';
import img9531_2 from './assets/imagens/Expo Sawubona/IMG_9531-2.JPG';
import img9531 from './assets/imagens/Expo Sawubona/IMG_9531.JPG';
import img9532_2 from './assets/imagens/Expo Sawubona/IMG_9532-2.JPG';
import img9532 from './assets/imagens/Expo Sawubona/IMG_9532.JPG';
import img9533 from './assets/imagens/Expo Sawubona/IMG_9533.JPG';
import img9535_2 from './assets/imagens/Expo Sawubona/IMG_9535-2.JPG';
import img9535 from './assets/imagens/Expo Sawubona/IMG_9535.JPG';

// 3. Fotografias
import mg4401_2 from './assets/imagens/Fotografias/_MG_4401-2.JPG';
import mg4406_2 from './assets/imagens/Fotografias/_MG_4406-2.JPG';
import mg4408 from './assets/imagens/Fotografias/_MG_4408.JPG';
import mg4413_2 from './assets/imagens/Fotografias/_MG_4413-2.JPG';

// 4. Guachê
import img5298 from './assets/imagens/Guachê/IMG_5298.JPG';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);

  const whatsappNumber = "5513991508282"; 
  const whatsappMessage = encodeURIComponent("Olá, Erika! Gostaria de saber mais sobre as obras das suas galerias.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const galerias = [
    {
      id: 'esculturas',
      titulo: 'Esculturas de Cor',
      obras: [img2694, img2695, img2696]
    },
    {
      id: 'sawubona',
      titulo: 'Expo Sawubona',
      obras: [
        img9494_2, img9494, img9495_2, img9495, 
        img9522_2, img9524, img9531_2, img9531, 
        img9532_2, img9532, img9533, img9535_2, img9535
      ]
    },
    {
      id: 'fotografias',
      titulo: 'Fotografias',
      obras: [mg4401_2, mg4406_2, mg4408, mg4413_2]
    },
    {
      id: 'guache',
      titulo: 'Guachê',
      obras: [img5298]
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#333333] font-sans scroll-smooth relative">
      
      {/* Header Componentizado */}
      <Header galerias={galerias} />

      {/* Seção: Quem Sou (Atualizada com o novo texto do estúdio) */}
      <section id="quem-sou" className="px-8 md:px-16 py-24 bg-[#f5f5f5] scroll-mt-32">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-1/3 aspect-square bg-[#e0e0e0] flex items-center justify-center text-[#616161] text-xs uppercase tracking-widest"
          >
            Foto de Perfil
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full md:w-2/3"
          >
            <h2 className="text-xl text-[#616161] uppercase tracking-[0.2em] mb-6 border-b border-[#e0e0e0] pb-2 inline-block">
              Quem Sou
            </h2>
            <div className="text-gray-600 space-y-4 leading-relaxed font-light text-sm md:text-base">
              <p>
                Somos um estúdio de arte, oferecemos trabalhos em fotografia e artes visuais. Atendemos arquitetos e decoradores, lojas de decoração, galerias e simpatizantes da arte.
              </p>
              <p className="font-semibold text-[#333333]">
                Erika Martins, Artista Visual e Fotógrafa
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Galerias Componentizada */}
      <main className="px-8 md:px-16 py-12 max-w-7xl mx-auto">
        {galerias.map((galeria) => (
          <GallerySection 
            key={galeria.id} 
            galeria={galeria} 
            onSelectImage={setSelectedImage} 
          />
        ))}
      </main>

      {/* Modal de Zoom Componentizado */}
      <ImageModal 
        selectedImage={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />

      {/* CTA WhatsApp Fixo */}
      <motion.a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        className="fixed bottom-8 right-8 bg-[#616161] text-white px-6 py-4 flex items-center gap-3 hover:bg-black transition-colors shadow-lg z-40 uppercase tracking-widest text-xs rounded-none"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Falar com a Artista
      </motion.a>
    </div>
  );
}
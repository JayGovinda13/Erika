import { useEffect, useState } from 'react';
import { conteudoPadrao, ordemGalerias } from '../data/conteudoPadrao';

// Reserva: imagens que já vêm junto com o site, usadas se a API não responder
// (por exemplo, se o site for publicado só como arquivos estáticos).
const imagensLocais = import.meta.glob('../assets/imagens/*/*.{JPG,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
});

function conteudoReserva() {
  const galerias = ordemGalerias.map((titulo) => {
    const obras = Object.entries(imagensLocais)
      .filter(([caminho]) => caminho.split('/').at(-2) === titulo)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([caminho, src]) => ({ id: caminho, src, titulo: '' }));
    const id = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { id, titulo, obras };
  });
  return { ...conteudoPadrao, galerias };
}

export default function useConteudo() {
  const [conteudo, setConteudo] = useState(null);

  useEffect(() => {
    let ativo = true;
    fetch('/api/conteudo')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((dados) => { if (ativo) setConteudo(dados && dados.galerias ? dados : conteudoReserva()); })
      .catch(() => { if (ativo) setConteudo(conteudoReserva()); });
    return () => { ativo = false; };
  }, []);

  return conteudo;
}

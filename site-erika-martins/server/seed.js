/*
  Cria o conteúdo inicial (data/content.json) a partir do que já existe hoje no site:
  textos atuais + imagens de src/assets/imagens. Roda sozinho na primeira vez que o
  servidor sobe; também pode ser executado manualmente com `npm run seed -- --forcar`.
*/
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, config } from './config.js';
import { lerConteudo, salvarConteudo, slug } from './conteudo.js';
import { processarImagem } from './imagens.js';
import { conteudoPadrao, ordemGalerias } from '../src/data/conteudoPadrao.js';

const PASTA_IMAGENS = path.join(RAIZ, 'src/assets/imagens');
const EXTENSOES = /\.(jpe?g|png|webp)$/i;

export async function semear({ forcar = false } = {}) {
  if (lerConteudo() && !forcar) return false;

  const galerias = [];
  for (const titulo of ordemGalerias) {
    const pasta = path.join(PASTA_IMAGENS, titulo);
    if (!fs.existsSync(pasta)) continue;
    const arquivos = fs.readdirSync(pasta).filter((a) => EXTENSOES.test(a)).sort();
    const obras = [];
    for (const arquivo of arquivos) {
      const buffer = fs.readFileSync(path.join(pasta, arquivo));
      obras.push({ ...(await processarImagem(buffer, arquivo)), titulo: '' });
    }
    galerias.push({ id: slug(titulo), titulo, obras });
  }

  salvarConteudo({ ...conteudoPadrao, galerias });
  console.log(`Conteúdo inicial criado em ${config.arquivoConteudo} (${galerias.length} galerias).`);
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  semear({ forcar: process.argv.includes('--forcar') }).then((criado) => {
    if (!criado) console.log('Já existe conteúdo. Use `npm run seed -- --forcar` para recriar.');
  });
}

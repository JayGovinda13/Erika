import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { config } from './config.js';
import { slug } from './conteudo.js';

const LADO_MAXIMO = 2400;

/**
 * Recebe a imagem original (buffer), corrige a rotação, reduz para no máximo
 * 2400px e salva como JPEG otimizado em data/uploads. Reprocessar a imagem também
 * descarta metadados (como localização GPS) e qualquer conteúdo estranho no arquivo.
 */
export async function processarImagem(buffer, nomeOriginal = 'imagem') {
  const base = slug(path.parse(nomeOriginal).name);
  const nome = `${base}-${crypto.randomBytes(4).toString('hex')}.jpg`;
  const destino = path.join(config.pastaUploads, nome);

  await sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(destino);

  return { id: nome.replace(/\.jpg$/, ''), src: `/uploads/${nome}` };
}

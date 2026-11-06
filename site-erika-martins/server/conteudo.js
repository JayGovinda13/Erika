import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

/*
  Formato do conteúdo do site (data/content.json):
  {
    sobre:   { titulo, paragrafos: [string], assinatura, foto: "/uploads/..." | "" },
    contato: { whatsapp: "5513...", mensagem },
    galerias: [ { id, titulo, obras: [ { id, src: "/uploads/...", titulo } ] } ],
    atualizadoEm
  }
*/

export function lerConteudo() {
  if (!fs.existsSync(config.arquivoConteudo)) return null;
  return JSON.parse(fs.readFileSync(config.arquivoConteudo, 'utf8'));
}

// Escrita atômica: grava em arquivo temporário e renomeia, para nunca corromper o JSON
export function salvarConteudo(conteudo) {
  const final = { ...conteudo, atualizadoEm: new Date().toISOString() };
  const tmp = `${config.arquivoConteudo}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(final, null, 2));
  fs.renameSync(tmp, config.arquivoConteudo);
  return final;
}

export function slug(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

// ---------- Validação do que chega do painel ----------
const texto = (v, max) => String(v ?? '').trim().slice(0, max);
const SRC_VALIDO = /^\/uploads\/[a-zA-Z0-9._-]+$/;

export function validarConteudo(entrada) {
  if (!entrada || typeof entrada !== 'object') throw new Error('Conteúdo inválido.');

  const sobre = entrada.sobre || {};
  const contato = entrada.contato || {};
  const foto = texto(sobre.foto, 300);

  const idsUsados = new Set();
  const galerias = (Array.isArray(entrada.galerias) ? entrada.galerias : []).slice(0, 50).map((g) => {
    const titulo = texto(g.titulo, 80);
    if (!titulo) throw new Error('Toda galeria precisa de um título.');
    let id = slug(g.id || titulo);
    while (idsUsados.has(id)) id = `${id}-2`;
    idsUsados.add(id);

    const obras = (Array.isArray(g.obras) ? g.obras : []).slice(0, 300).map((o) => {
      const src = texto(o.src, 300);
      if (!SRC_VALIDO.test(src)) throw new Error(`Imagem inválida na galeria "${titulo}".`);
      return { id: texto(o.id, 60) || path.parse(src).name, src, titulo: texto(o.titulo, 120) };
    });
    return { id, titulo, obras };
  });

  const whatsapp = texto(contato.whatsapp, 20).replace(/\D/g, '');

  return {
    sobre: {
      titulo: texto(sobre.titulo, 80) || 'Quem Sou',
      paragrafos: (Array.isArray(sobre.paragrafos) ? sobre.paragrafos : [])
        .map((p) => texto(p, 3000)).filter(Boolean).slice(0, 20),
      assinatura: texto(sobre.assinatura, 160),
      foto: SRC_VALIDO.test(foto) ? foto : '',
    },
    contato: { whatsapp, mensagem: texto(contato.mensagem, 500) },
    galerias,
  };
}

// Remove do disco as imagens que não são mais usadas em nenhum lugar do site
export function limparUploadsOrfaos(conteudo) {
  const usados = new Set();
  if (conteudo.sobre?.foto) usados.add(path.basename(conteudo.sobre.foto));
  for (const g of conteudo.galerias) for (const o of g.obras) usados.add(path.basename(o.src));

  const LIMITE_MS = 60 * 60 * 1000; // preserva envios recentes (ainda não salvos)
  for (const arquivo of fs.readdirSync(config.pastaUploads)) {
    if (usados.has(arquivo)) continue;
    const caminho = path.join(config.pastaUploads, arquivo);
    try {
      if (Date.now() - fs.statSync(caminho).mtimeMs > LIMITE_MS) fs.unlinkSync(caminho);
    } catch { /* ignora */ }
  }
}

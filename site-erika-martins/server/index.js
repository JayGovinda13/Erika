import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { config } from './config.js';
import {
  exigirLogin, iniciarSessao, encerrarSessao, usuarioDaSessao, validarLogin,
  limitarTentativas, registrarFalha, limparFalhas, senhaAtualConfere, trocarSenha,
  credenciaisConfiguradas,
} from './auth.js';
import { lerConteudo, salvarConteudo, validarConteudo, limparUploadsOrfaos } from './conteudo.js';
import { processarImagem } from './imagens.js';
import { semear } from './seed.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // necessário atrás de proxies (Render, Railway, Nginx...)

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const api = express.Router();

// ---------- Público ----------
api.get('/conteudo', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json(lerConteudo());
});

// ---------- Autenticação ----------
api.post('/login', limitarTentativas, (req, res) => {
  const { usuario, senha } = req.body || {};
  if (!validarLogin(usuario, senha)) {
    registrarFalha(req.ip);
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }
  limparFalhas(req.ip);
  iniciarSessao(res, String(usuario).trim().toLowerCase());
  res.json({ ok: true });
});

api.post('/logout', (req, res) => {
  encerrarSessao(res);
  res.json({ ok: true });
});

api.get('/sessao', (req, res) => {
  const usuario = usuarioDaSessao(req);
  res.status(usuario ? 200 : 401).json({ usuario });
});

api.post('/senha', exigirLogin, limitarTentativas, (req, res) => {
  const { senhaAtual, novaSenha } = req.body || {};
  if (!senhaAtualConfere(senhaAtual)) {
    registrarFalha(req.ip);
    return res.status(400).json({ erro: 'Senha atual incorreta.' });
  }
  if (typeof novaSenha !== 'string' || novaSenha.length < 8) {
    return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 8 caracteres.' });
  }
  trocarSenha(novaSenha);
  res.json({ ok: true });
});

// ---------- Edição do conteúdo (somente logado) ----------
api.put('/conteudo', exigirLogin, (req, res) => {
  try {
    const salvo = salvarConteudo(validarConteudo(req.body));
    limparUploadsOrfaos(salvo);
    res.json(salvo);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 30 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|heic|heif|avif)$/.test(file.mimetype)),
});

api.post('/upload', exigirLogin, upload.array('imagens', 30), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ erro: 'Envie arquivos de imagem (JPG, PNG ou WEBP).' });
  try {
    const obras = [];
    for (const f of req.files) obras.push({ ...(await processarImagem(f.buffer, f.originalname)), titulo: '' });
    res.json({ obras });
  } catch {
    res.status(400).json({ erro: 'Não foi possível processar uma das imagens.' });
  }
});

app.use('/api', api);

// Erros de upload (arquivo grande demais etc.)
app.use('/api', (err, req, res, _next) => {
  const msg = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
    ? 'Imagem muito grande (máximo 25 MB).'
    : 'Erro ao processar a requisição.';
  res.status(400).json({ erro: msg });
});
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// ---------- Arquivos estáticos ----------
app.use('/uploads', express.static(config.pastaUploads, { maxAge: '30d', immutable: true }));

// Em produção, o mesmo servidor entrega o site já compilado (npm run build)
if (fs.existsSync(config.pastaDist)) {
  app.use(express.static(config.pastaDist, { index: false, maxAge: '1h' }));
  app.get(/.*/, (req, res) => res.sendFile(path.join(config.pastaDist, 'index.html')));
}

await semear();
app.listen(config.porta, () => {
  console.log(`Servidor da Erika rodando em http://localhost:${config.porta}`);
  if (!credenciaisConfiguradas()) {
    console.warn('[aviso] Nenhuma senha configurada. Defina ADMIN_PASSWORD no .env para liberar o painel.');
  }
});

import crypto from 'node:crypto';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

const COOKIE = 'erika_sessao';
const DURACAO_SESSAO_H = 12;

// ---------- Hash de senha (scrypt nativo do Node) ----------
export function gerarHash(senha) {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, sal, 64).toString('hex');
  return `scrypt:${sal}:${hash}`;
}

function conferirHash(senha, armazenado) {
  const [tipo, sal, hash] = String(armazenado).split(':');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const calculado = crypto.scryptSync(senha, sal, 64);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === calculado.length && crypto.timingSafeEqual(calculado, esperado);
}

// A senha fica em data/admin.json. Na primeira execução é criada a partir de ADMIN_PASSWORD.
function lerCredenciais() {
  if (fs.existsSync(config.arquivoSenha)) {
    return JSON.parse(fs.readFileSync(config.arquivoSenha, 'utf8'));
  }
  if (!config.senhaInicial) return null;
  const cred = { usuario: config.usuarioAdmin, hash: gerarHash(config.senhaInicial) };
  fs.writeFileSync(config.arquivoSenha, JSON.stringify(cred, null, 2));
  return cred;
}

export function trocarSenha(novaSenha) {
  const cred = lerCredenciais() || { usuario: config.usuarioAdmin };
  cred.hash = gerarHash(novaSenha);
  fs.writeFileSync(config.arquivoSenha, JSON.stringify(cred, null, 2));
}

export function validarLogin(usuario, senha) {
  const cred = lerCredenciais();
  if (!cred) return false;
  const usuarioOk = String(usuario || '').trim().toLowerCase() === cred.usuario.toLowerCase();
  const senhaOk = conferirHash(String(senha || ''), cred.hash);
  return usuarioOk && senhaOk;
}

export function senhaAtualConfere(senha) {
  const cred = lerCredenciais();
  return !!cred && conferirHash(String(senha || ''), cred.hash);
}

// ---------- Sessão (JWT em cookie httpOnly) ----------
export function iniciarSessao(res, usuario) {
  const token = jwt.sign({ sub: usuario }, config.segredoJwt, { expiresIn: `${DURACAO_SESSAO_H}h` });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.producao,
    maxAge: DURACAO_SESSAO_H * 60 * 60 * 1000,
    path: '/',
  });
}

export function encerrarSessao(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function usuarioDaSessao(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, config.segredoJwt).sub;
  } catch {
    return null;
  }
}

export function exigirLogin(req, res, next) {
  const usuario = usuarioDaSessao(req);
  if (!usuario) return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  req.usuario = usuario;
  next();
}

// ---------- Limite simples de tentativas de login ----------
const tentativas = new Map(); // ip -> { qtd, desde }
const JANELA_MS = 15 * 60 * 1000;
const MAX_TENTATIVAS = 8;

export function limitarTentativas(req, res, next) {
  const ip = req.ip;
  const agora = Date.now();
  const reg = tentativas.get(ip);
  if (reg && agora - reg.desde < JANELA_MS && reg.qtd >= MAX_TENTATIVAS) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.' });
  }
  next();
}

export function registrarFalha(ip) {
  const agora = Date.now();
  const reg = tentativas.get(ip);
  if (!reg || agora - reg.desde >= JANELA_MS) tentativas.set(ip, { qtd: 1, desde: agora });
  else reg.qtd += 1;
}

export function limparFalhas(ip) {
  tentativas.delete(ip);
}

export function credenciaisConfiguradas() {
  return !!lerCredenciais();
}

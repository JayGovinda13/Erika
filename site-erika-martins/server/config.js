import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ = path.resolve(__dirname, '..');

// Carrega variáveis do arquivo .env (se existir) — recurso nativo do Node 20.12+
const arquivoEnv = path.join(RAIZ, '.env');
if (fs.existsSync(arquivoEnv)) process.loadEnvFile(arquivoEnv);

const producao = process.env.NODE_ENV === 'production';

export const config = {
  producao,
  porta: Number(process.env.PORT) || 3001,
  // Pasta onde ficam o conteúdo (content.json), a senha e as imagens enviadas
  pastaDados: path.resolve(RAIZ, process.env.DATA_DIR || 'data'),
  pastaDist: path.join(RAIZ, 'dist'),
  usuarioAdmin: process.env.ADMIN_USER || 'erika',
  senhaInicial: process.env.ADMIN_PASSWORD || '',
  segredoJwt: process.env.JWT_SECRET || '',
};

config.pastaUploads = path.join(config.pastaDados, 'uploads');
config.arquivoConteudo = path.join(config.pastaDados, 'content.json');
config.arquivoSenha = path.join(config.pastaDados, 'admin.json');

if (!config.segredoJwt) {
  if (producao) {
    console.error('ERRO: defina JWT_SECRET no .env antes de rodar em produção.');
    process.exit(1);
  }
  config.segredoJwt = 'segredo-somente-para-desenvolvimento';
  console.warn('[aviso] JWT_SECRET não definido — usando segredo de desenvolvimento.');
}

fs.mkdirSync(config.pastaUploads, { recursive: true });

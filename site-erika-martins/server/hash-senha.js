// Redefine a senha do painel pelo terminal: npm run hash-senha -- "nova senha"
import { trocarSenha } from './auth.js';

const senha = process.argv[2];
if (!senha || senha.length < 8) {
  console.error('Uso: npm run hash-senha -- "nova senha com 8+ caracteres"');
  process.exit(1);
}
trocarSenha(senha);
console.log('Senha do painel atualizada.');

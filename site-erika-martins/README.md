# Site Erika Martins

Site (React + Vite) com back-end (Node + Express) e painel administrativo para a
Erika atualizar o conteúdo sozinha.

## Estrutura

```
server/            Back-end (API, login, upload de imagens)
  index.js         Servidor Express: API + arquivos do site
  auth.js          Login, sessão (cookie seguro) e senha
  conteudo.js      Leitura/validação/gravação do conteúdo do site
  imagens.js       Otimização das imagens enviadas (sharp)
  seed.js          Cria o conteúdo inicial a partir das imagens atuais
src/
  App.jsx          Site público (lê o conteúdo de /api/conteudo)
  admin/           Painel em /admin (login, galerias, quem sou, contato, senha)
  hooks/useConteudo.js
  data/conteudoPadrao.js   Textos padrão / reserva
data/              (criada automaticamente, fora do git) conteúdo, senha e imagens enviadas
```

## O que a Erika pode fazer no painel (`/admin`)

- **Galerias:** criar, renomear, excluir e reordenar galerias; enviar várias imagens
  de uma vez; remover, reordenar e legendar obras.
- **Quem Sou:** foto de perfil, título, texto e assinatura.
- **Contato:** número do WhatsApp e mensagem automática.
- **Minha conta:** trocar a senha.

Nada vai para o site até ela clicar em **Salvar e publicar**.

## Rodando localmente

```bash
npm install
cp .env.example .env     # e preencha ADMIN_PASSWORD e JWT_SECRET
npm run dev              # site em http://localhost:5173, painel em /admin
```

Na primeira vez, o servidor copia e otimiza as fotos de `src/assets/imagens` para
`data/uploads` (leva alguns segundos).

## Produção

O site precisa de um servidor Node (ex.: Render, Railway, Fly.io ou uma VPS) —
hospedagem apenas estática não roda o back-end.

```bash
npm install
npm run build
npm start                # serve o site, o painel e a API na porta PORT
```

Importante:
- Defina `JWT_SECRET` (obrigatório em produção) e `ADMIN_PASSWORD` no ambiente.
- A pasta `DATA_DIR` precisa ficar num **disco persistente**, senão as alterações
  da Erika se perdem a cada novo deploy.
- Use HTTPS (o cookie de login é marcado como `secure` em produção).

Esqueceu a senha? No servidor: `npm run hash-senha -- "nova senha"`.

## Segurança

- Senha guardada com hash `scrypt`; sessão em cookie `httpOnly` + `SameSite=Strict` (12 h).
- Limite de tentativas de login (8 a cada 15 min por IP).
- Toda imagem enviada é reprocessada (remove metadados/GPS, máx. 2400 px, JPEG otimizado).
- O conteúdo enviado pelo painel é validado no servidor; imagens que deixam de ser
  usadas são apagadas automaticamente.

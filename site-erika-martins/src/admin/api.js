// Pequeno cliente para conversar com o back-end
async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, { credentials: 'same-origin', ...opcoes });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(dados.erro || 'Não foi possível falar com o servidor.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

const json = (metodo, corpo) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(corpo),
});

export const api = {
  sessao: () => requisicao('/api/sessao'),
  login: (usuario, senha) => requisicao('/api/login', json('POST', { usuario, senha })),
  logout: () => requisicao('/api/logout', { method: 'POST' }),
  conteudo: () => requisicao('/api/conteudo'),
  salvar: (conteudo) => requisicao('/api/conteudo', json('PUT', conteudo)),
  trocarSenha: (senhaAtual, novaSenha) => requisicao('/api/senha', json('POST', { senhaAtual, novaSenha })),
  enviarImagens: (arquivos) => {
    const form = new FormData();
    for (const arquivo of arquivos) form.append('imagens', arquivo);
    return requisicao('/api/upload', { method: 'POST', body: form });
  },
};

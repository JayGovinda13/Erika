import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import logo from '../assets/LOGO-HORIZONTAL-TRANSPARENTE.png';

const ABAS = [
  { id: 'galerias', nome: 'Galerias' },
  { id: 'sobre', nome: 'Quem Sou' },
  { id: 'contato', nome: 'Contato' },
  { id: 'conta', nome: 'Minha conta' },
];

const mover = (lista, de, para) => {
  if (para < 0 || para >= lista.length) return lista;
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  nova.splice(para, 0, item);
  return nova;
};

export default function Painel({ onSair }) {
  const [aba, setAba] = useState('galerias');
  const [original, setOriginal] = useState(null);
  const [rascunho, setRascunho] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'ok' | 'erro', texto }
  const [versao, setVersao] = useState(0); // remonta os editores ao salvar/descartar

  const alterado = original && JSON.stringify(original) !== JSON.stringify(rascunho);

  useEffect(() => {
    api.conteudo().then((c) => { setOriginal(c); setRascunho(c); })
      .catch((e) => setAviso({ tipo: 'erro', texto: e.message }));
  }, []);

  // Avisa antes de fechar a aba com alterações não salvas
  useEffect(() => {
    if (!alterado) return;
    const alerta = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', alerta);
    return () => window.removeEventListener('beforeunload', alerta);
  }, [alterado]);

  useEffect(() => {
    if (aviso?.tipo !== 'ok') return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const tratarErro = (e) => {
    if (e.status === 401) return onSair();
    setAviso({ tipo: 'erro', texto: e.message });
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const salvo = await api.salvar(rascunho);
      setOriginal(salvo);
      setRascunho(salvo);
      setVersao((v) => v + 1);
      setAviso({ tipo: 'ok', texto: 'Alterações publicadas no site!' });
    } catch (e) {
      tratarErro(e);
    } finally {
      setSalvando(false);
    }
  };

  const sair = async () => {
    if (alterado && !window.confirm('Você tem alterações não salvas. Sair mesmo assim?')) return;
    await api.logout().catch(() => {});
    onSair();
  };

  const atualizar = (parte, valor) => setRascunho((r) => ({ ...r, [parte]: valor }));

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#333333] pb-32">
      <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Erika Martins" className="h-9 w-auto" />
            <span className="hidden sm:inline text-xs uppercase tracking-widest text-[#616161] border-l border-[#e0e0e0] pl-4">
              Painel
            </span>
          </div>
          <div className="flex gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="botao-sec">Ver site ↗</a>
            <button onClick={sair} className="botao-sec">Sair</button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 md:px-8 flex gap-6 overflow-x-auto">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`py-3 text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                aba === a.id ? 'border-[#333333] text-black' : 'border-transparent text-[#616161] hover:text-black'
              }`}
            >
              {a.nome}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {!rascunho ? (
          <p className="text-sm text-[#616161]">Carregando…</p>
        ) : (
          <div key={versao}>
            {aba === 'galerias' && (
              <EditorGalerias galerias={rascunho.galerias} onChange={(g) => atualizar('galerias', g)} onErro={tratarErro} />
            )}
            {aba === 'sobre' && (
              <EditorSobre sobre={rascunho.sobre} onChange={(s) => atualizar('sobre', s)} onErro={tratarErro} />
            )}
            {aba === 'contato' && (
              <EditorContato contato={rascunho.contato} onChange={(c) => atualizar('contato', c)} />
            )}
            {aba === 'conta' && <MinhaConta onErro={tratarErro} />}
          </div>
        )}
      </main>

      {aviso && (
        <div
          role="status"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 text-sm shadow-lg ${
            aviso.tipo === 'ok' ? 'bg-[#333333] text-white' : 'bg-red-700 text-white'
          }`}
        >
          {aviso.texto}
          {aviso.tipo === 'erro' && (
            <button onClick={() => setAviso(null)} className="ml-4 underline">fechar</button>
          )}
        </div>
      )}

      {alterado && aba !== 'conta' && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#e0e0e0] z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-[#616161]">Você tem alterações que ainda não estão no site.</span>
            <div className="flex gap-2">
              <button onClick={() => { setRascunho(original); setVersao((v) => v + 1); }} disabled={salvando} className="botao-sec">Descartar</button>
              <button onClick={salvar} disabled={salvando} className="botao">
                {salvando ? 'Salvando…' : 'Salvar e publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function BotaoEnviar({ multiplo = true, texto, onArquivos, enviando }) {
  const ref = useRef(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple={multiplo}
        className="hidden"
        onChange={(e) => {
          const arquivos = [...e.target.files];
          e.target.value = '';
          if (arquivos.length) onArquivos(arquivos);
        }}
      />
      <button type="button" onClick={() => ref.current.click()} disabled={enviando} className="botao-sec">
        {enviando ? 'Enviando…' : texto}
      </button>
    </>
  );
}

// ---------------------------------------------------------------------------
function EditorGalerias({ galerias, onChange, onErro }) {
  const [enviandoEm, setEnviandoEm] = useState(null);

  const alterarGaleria = (i, mudancas) =>
    onChange(galerias.map((g, j) => (j === i ? { ...g, ...mudancas } : g)));

  const novaGaleria = () =>
    onChange([...galerias, { id: `nova-${Date.now()}`, titulo: 'Nova galeria', obras: [] }]);

  const excluirGaleria = (i) => {
    const g = galerias[i];
    const msg = g.obras.length
      ? `Excluir a galeria "${g.titulo}" e suas ${g.obras.length} imagens?`
      : `Excluir a galeria "${g.titulo}"?`;
    if (window.confirm(msg)) onChange(galerias.filter((_, j) => j !== i));
  };

  const enviar = async (i, arquivos) => {
    setEnviandoEm(i);
    try {
      const { obras } = await api.enviarImagens(arquivos);
      onChange(galerias.map((g, j) => (j === i ? { ...g, obras: [...g.obras, ...obras] } : g)));
    } catch (e) {
      onErro(e);
    } finally {
      setEnviandoEm(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base mb-1">Galerias</h2>
          <p className="text-sm text-[#616161]">
            Adicione, remova e reordene obras. Galerias sem imagens não aparecem no site.
          </p>
        </div>
        <button onClick={novaGaleria} className="botao">+ Nova galeria</button>
      </div>

      {galerias.map((galeria, i) => (
        <section key={galeria.id} className="bg-white p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <div className="flex-1 min-w-[200px]">
              <label className="rotulo" htmlFor={`titulo-${galeria.id}`}>Nome da galeria</label>
              <input
                id={`titulo-${galeria.id}`}
                value={galeria.titulo}
                onChange={(e) => alterarGaleria(i, { titulo: e.target.value })}
                className="campo"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => onChange(mover(galerias, i, i - 1))} disabled={i === 0} className="botao-sec" title="Subir galeria">↑</button>
              <button onClick={() => onChange(mover(galerias, i, i + 1))} disabled={i === galerias.length - 1} className="botao-sec" title="Descer galeria">↓</button>
              <button onClick={() => excluirGaleria(i)} className="botao-sec hover:!border-red-700 hover:!text-red-700">Excluir</button>
            </div>
          </div>

          {galeria.obras.length === 0 ? (
            <p className="text-sm text-[#616161] border border-dashed border-[#e0e0e0] p-6 text-center mb-4">
              Nenhuma imagem ainda.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
              {galeria.obras.map((obra, k) => (
                <div key={obra.id} className="group">
                  <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                    <img src={obra.src} alt="" loading="lazy" className="w-full h-full object-cover" />
                    <button
                      onClick={() => alterarGaleria(i, { obras: galeria.obras.filter((_, j) => j !== k) })}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-red-700 hover:text-white w-7 h-7 text-sm"
                      title="Remover imagem"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      <button
                        onClick={() => alterarGaleria(i, { obras: mover(galeria.obras, k, k - 1) })}
                        disabled={k === 0}
                        className="bg-white/90 hover:bg-white w-7 h-7 text-sm disabled:opacity-30"
                        title="Mover para a esquerda"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => alterarGaleria(i, { obras: mover(galeria.obras, k, k + 1) })}
                        disabled={k === galeria.obras.length - 1}
                        className="bg-white/90 hover:bg-white w-7 h-7 text-sm disabled:opacity-30"
                        title="Mover para a direita"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  <input
                    value={obra.titulo}
                    placeholder="Legenda (opcional)"
                    onChange={(e) =>
                      alterarGaleria(i, {
                        obras: galeria.obras.map((o, j) => (j === k ? { ...o, titulo: e.target.value } : o)),
                      })
                    }
                    className="campo mt-2 !text-xs !py-1.5"
                  />
                </div>
              ))}
            </div>
          )}

          <BotaoEnviar texto="+ Adicionar imagens" enviando={enviandoEm === i} onArquivos={(a) => enviar(i, a)} />
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
function EditorSobre({ sobre, onChange, onErro }) {
  // O texto fica num campo só; parágrafos são separados por uma linha em branco
  const [texto, setTexto] = useState(sobre.paragrafos.join('\n\n'));
  const [enviando, setEnviando] = useState(false);

  const alterarTexto = (valor) => {
    setTexto(valor);
    onChange({ ...sobre, paragrafos: valor.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) });
  };

  const enviarFoto = async ([arquivo]) => {
    setEnviando(true);
    try {
      const { obras } = await api.enviarImagens([arquivo]);
      onChange({ ...sobre, foto: obras[0].src });
    } catch (e) {
      onErro(e);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white p-5 md:p-8 shadow-sm grid md:grid-cols-[240px_1fr] gap-8">
      <div>
        <span className="rotulo">Foto de perfil</span>
        <div className="aspect-square bg-[#e0e0e0] mb-3 flex items-center justify-center text-xs text-[#616161] uppercase tracking-widest overflow-hidden">
          {sobre.foto ? <img src={sobre.foto} alt="" className="w-full h-full object-cover" /> : 'Sem foto'}
        </div>
        <div className="flex flex-wrap gap-2">
          <BotaoEnviar multiplo={false} texto={sobre.foto ? 'Trocar foto' : 'Enviar foto'} enviando={enviando} onArquivos={enviarFoto} />
          {sobre.foto && (
            <button onClick={() => onChange({ ...sobre, foto: '' })} className="botao-sec">Remover</button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="rotulo" htmlFor="sobre-titulo">Título da seção</label>
          <input id="sobre-titulo" value={sobre.titulo} onChange={(e) => onChange({ ...sobre, titulo: e.target.value })} className="campo" />
        </div>
        <div>
          <label className="rotulo" htmlFor="sobre-texto">Texto</label>
          <textarea id="sobre-texto" rows={9} value={texto} onChange={(e) => alterarTexto(e.target.value)} className="campo leading-relaxed" />
          <p className="text-xs text-[#616161] mt-1">Deixe uma linha em branco para começar um novo parágrafo.</p>
        </div>
        <div>
          <label className="rotulo" htmlFor="sobre-assinatura">Assinatura (em destaque)</label>
          <input id="sobre-assinatura" value={sobre.assinatura} onChange={(e) => onChange({ ...sobre, assinatura: e.target.value })} className="campo" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function EditorContato({ contato, onChange }) {
  const numero = contato.whatsapp.replace(/\D/g, '');
  const teste = `https://wa.me/${numero}?text=${encodeURIComponent(contato.mensagem)}`;
  return (
    <div className="bg-white p-5 md:p-8 shadow-sm max-w-2xl space-y-5">
      <div>
        <label className="rotulo" htmlFor="whatsapp">Número do WhatsApp</label>
        <input
          id="whatsapp"
          inputMode="numeric"
          value={contato.whatsapp}
          onChange={(e) => onChange({ ...contato, whatsapp: e.target.value.replace(/\D/g, '') })}
          className="campo"
          placeholder="5513999999999"
        />
        <p className="text-xs text-[#616161] mt-1">Somente números, com 55 (Brasil) + DDD. Ex.: 5513991508282</p>
      </div>
      <div>
        <label className="rotulo" htmlFor="mensagem">Mensagem automática</label>
        <textarea id="mensagem" rows={3} value={contato.mensagem} onChange={(e) => onChange({ ...contato, mensagem: e.target.value })} className="campo" />
      </div>
      <a href={teste} target="_blank" rel="noopener noreferrer" className="botao-sec">Testar link ↗</a>
    </div>
  );
}

// ---------------------------------------------------------------------------
function MinhaConta({ onErro }) {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirma, setConfirma] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setMensagem(null);
    if (nova !== confirma) return setMensagem({ erro: true, texto: 'As senhas novas não são iguais.' });
    try {
      await api.trocarSenha(atual, nova);
      setAtual(''); setNova(''); setConfirma('');
      setMensagem({ erro: false, texto: 'Senha alterada com sucesso.' });
    } catch (err) {
      if (err.status === 401) return onErro(err);
      setMensagem({ erro: true, texto: err.message });
    }
  };

  return (
    <form onSubmit={enviar} className="bg-white p-5 md:p-8 shadow-sm max-w-md space-y-5">
      <h2 className="text-base">Trocar senha</h2>
      <div>
        <label className="rotulo" htmlFor="senha-atual">Senha atual</label>
        <input id="senha-atual" type="password" autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} className="campo" required />
      </div>
      <div>
        <label className="rotulo" htmlFor="senha-nova">Nova senha (mín. 8 caracteres)</label>
        <input id="senha-nova" type="password" autoComplete="new-password" minLength={8} value={nova} onChange={(e) => setNova(e.target.value)} className="campo" required />
      </div>
      <div>
        <label className="rotulo" htmlFor="senha-confirma">Repita a nova senha</label>
        <input id="senha-confirma" type="password" autoComplete="new-password" minLength={8} value={confirma} onChange={(e) => setConfirma(e.target.value)} className="campo" required />
      </div>
      {mensagem && (
        <p className={`text-sm ${mensagem.erro ? 'text-red-700' : 'text-green-800'}`} role="status">{mensagem.texto}</p>
      )}
      <button type="submit" className="botao">Salvar nova senha</button>
    </form>
  );
}

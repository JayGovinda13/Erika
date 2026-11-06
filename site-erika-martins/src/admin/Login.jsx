import { useState } from 'react';
import { api } from './api';
import logo from '../assets/LOGO-HORIZONTAL-TRANSPARENTE.png';

export default function Login({ onEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await api.login(usuario, senha);
      onEntrar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <form onSubmit={entrar} className="w-full max-w-sm bg-white p-8 md:p-10 shadow-sm">
        <img src={logo} alt="Erika Martins" className="h-12 w-auto mx-auto mb-8" />
        <h1 className="text-sm text-center mb-8">Painel do site</h1>

        <label className="block text-xs uppercase tracking-widest text-[#616161] mb-2" htmlFor="usuario">
          Usuário
        </label>
        <input
          id="usuario"
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="campo mb-5"
          required
          autoFocus
        />

        <label className="block text-xs uppercase tracking-widest text-[#616161] mb-2" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="campo mb-6"
          required
        />

        {erro && <p className="text-sm text-red-700 mb-4" role="alert">{erro}</p>}

        <button type="submit" disabled={enviando} className="botao w-full">
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <a href="/" className="block text-center text-xs text-[#616161] mt-6 hover:text-black">
          ← Voltar ao site
        </a>
      </form>
    </div>
  );
}

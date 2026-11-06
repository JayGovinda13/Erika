import { useEffect, useState } from 'react';
import { api } from './api';
import Login from './Login';
import Painel from './Painel';

export default function AdminApp() {
  const [estado, setEstado] = useState('verificando'); // verificando | deslogado | logado

  useEffect(() => {
    document.title = 'Painel · Erika Martins';
    api.sessao().then(() => setEstado('logado')).catch(() => setEstado('deslogado'));
  }, []);

  if (estado === 'verificando') return <div className="min-h-screen bg-[#f5f5f5]" />;
  if (estado === 'deslogado') return <Login onEntrar={() => setEstado('logado')} />;
  return <Painel onSair={() => setEstado('deslogado')} />;
}

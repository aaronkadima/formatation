import { useState, type FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/orders';

export function EmailLogin({ next, compact = false }: { next: string; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    });
    setBusy(false);
    if (error) setError(errorMessage(error));
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="alert ok" role="status">
        Enviamos um link de acesso para <strong>{email}</strong>. Abra o e-mail neste mesmo navegador para continuar. Não chegou? Confira o spam ou{' '}
        <button type="button" className="link-btn" onClick={() => setSent(false)}>tente outro e-mail</button>.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: compact ? 'none' : 460 }}>
      <div className="field">
        <label htmlFor="login-email">Seu e-mail</label>
        <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@universidade.br" />
        <span className="hint">Sem senha: você recebe um link de acesso a cada entrada.</span>
      </div>
      {error && <p className="alert error" role="alert" style={{ margin: 0 }}>{error}</p>}
      <button className="btn btn-primary" disabled={busy} style={{ alignSelf: 'flex-start' }}>{busy ? 'Enviando…' : 'Receber link de acesso'}</button>
    </form>
  );
}

export default function Entrar() {
  const { session } = useAuth();
  const [params] = useSearchParams();
  const next = params.get('next') || '/conta';
  if (!supabase) return <Navigate to="/pedido" replace />;
  if (session) return <Navigate to={next} replace />;

  return (
    <main className="container app-page">
      <p className="kicker">Área do cliente</p>
      <h1 className="h-display h2" style={{ marginBottom: 16 }}>Acompanhe seus pedidos.</h1>
      <p className="lead" style={{ marginBottom: 32 }}>Entre com o e-mail usado no pedido para ver orçamentos, aprovar e baixar suas entregas.</p>
      <div className="panel" style={{ maxWidth: 560 }}>
        <EmailLogin next={next} />
      </div>
    </main>
  );
}

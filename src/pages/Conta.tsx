import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { serviceTitle } from '../lib/catalog';
import { formatDate, formatMoney, requireDb, type Order } from '../lib/supabase';
import { errorMessage } from '../lib/orders';
import { Spinner, StatusBadge } from '../components/ui';

export default function Conta() {
  const { session, profile, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    requireDb()
      .from('orders')
      .select('*')
      .eq('client_id', session!.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setOrders((data ?? []) as Order[]);
      });
  }, [session]);

  const pending = orders?.filter((o) => o.status === 'orcamento_enviado') ?? [];

  return (
    <main className="container app-page">
      <div className="app-title">
        <div>
          <p className="kicker">Área do cliente</p>
          <h1 className="h-display h2">Olá{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.</h1>
        </div>
        <Link to="/pedido" className="btn btn-primary">Novo pedido</Link>
      </div>

      {pending.length > 0 && (
        <div className="alert info" style={{ marginBottom: 20 }}>
          Você tem {pending.length === 1 ? 'um orçamento esperando' : `${pending.length} orçamentos esperando`} aprovação.{' '}
          <Link to={`/conta/pedidos/${pending[0].id}`}>Ver orçamento</Link>
        </div>
      )}

      <div className="cols">
        <section className="main" aria-labelledby="meus-pedidos">
          <h2 id="meus-pedidos" className="panel-title">Meus pedidos</h2>
          {error && <p className="alert error">{error}</p>}
          {!orders ? <Spinner /> : orders.length === 0 ? (
            <div className="panel empty">
              <p style={{ marginTop: 0 }}>Você ainda não fez nenhum pedido.</p>
              <Link to="/pedido" className="btn btn-dark">Pedir orçamento</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Pedido</th><th>Serviços</th><th>Status</th><th>Orçamento</th><th>Data</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><Link to={`/conta/pedidos/${o.id}`} className="mono" style={{ fontWeight: 500 }}>{o.code}</Link><div className="muted" style={{ fontSize: 13 }}>{o.document_type}</div></td>
                      <td style={{ maxWidth: 280 }}>{o.services.map(serviceTitle).join(', ')}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="mono">{formatMoney(o.quote_amount)}</td>
                      <td className="mono muted">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <aside className="side">
          <ProfileForm key={profile?.id ?? 'none'} onSaved={refreshProfile} />
        </aside>
      </div>
    </main>
  );
}

function ProfileForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const { session, profile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [institution, setInstitution] = useState(profile?.institution ?? '');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await requireDb()
      .from('profiles')
      .update({ full_name: name.trim(), phone: phone.trim(), institution: institution.trim() || null })
      .eq('id', session!.user.id);
    setBusy(false);
    if (error) setMsg({ ok: false, text: errorMessage(error) });
    else {
      setMsg({ ok: true, text: 'Dados salvos.' });
      onSaved();
    }
  }

  return (
    <form className="panel" onSubmit={save}>
      <p className="panel-title">Meus dados</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field"><label htmlFor="p-email">E-mail</label><input id="p-email" type="email" value={session?.user.email ?? ''} disabled /></div>
        <div className="field"><label htmlFor="p-name">Nome</label><input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="field"><label htmlFor="p-phone">WhatsApp</label><input id="p-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="field"><label htmlFor="p-inst">Instituição</label><input id="p-inst" type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} /></div>
        {msg && <p className={`alert ${msg.ok ? 'ok' : 'error'}`} role="status" style={{ margin: 0 }}>{msg.text}</p>}
        <button className="btn btn-dark" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  );
}

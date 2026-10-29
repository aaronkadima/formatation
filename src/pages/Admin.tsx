import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { STATUS, serviceTitle, type OrderStatus } from '../lib/catalog';
import { formatDate, formatMoney, requireDb, type Order } from '../lib/supabase';
import { ORDER_SELECT } from '../lib/orders';
import { Spinner, StatusBadge } from '../components/ui';

type Filter = OrderStatus | 'abertos' | 'todos';

const OPEN: OrderStatus[] = ['recebido', 'orcamento_enviado', 'aprovado', 'em_andamento'];

export default function Admin() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('abertos');
  const [q, setQ] = useState('');

  useEffect(() => {
    requireDb()
      .from('orders')
      .select(ORDER_SELECT)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setOrders((data ?? []) as Order[]);
      });
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: orders?.length ?? 0, abertos: 0 };
    orders?.forEach((o) => {
      c[o.status] = (c[o.status] ?? 0) + 1;
      if (OPEN.includes(o.status)) c.abertos += 1;
    });
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      if (filter === 'abertos' && !OPEN.includes(o.status)) return false;
      if (filter !== 'abertos' && filter !== 'todos' && o.status !== filter) return false;
      if (!term) return true;
      return [o.code, o.profiles?.full_name, o.profiles?.email, o.profiles?.institution]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term));
    });
  }, [orders, filter, q]);

  const awaitingQuote = counts['recebido'] ?? 0;
  const inProgress = (counts['aprovado'] ?? 0) + (counts['em_andamento'] ?? 0);
  const late = (orders ?? []).filter(
    (o) => OPEN.includes(o.status) && o.quote_deadline && new Date(o.quote_deadline + 'T23:59') < new Date(),
  ).length;

  const filters: { id: Filter; label: string }[] = [
    { id: 'abertos', label: 'Em aberto' },
    ...STATUS.map((s) => ({ id: s.id as Filter, label: s.label })),
    { id: 'todos', label: 'Todos' },
  ];

  return (
    <main className="container app-page">
      <div className="app-title">
        <div>
          <p className="kicker">Painel</p>
          <h1 className="h-display h2">Pedidos</h1>
        </div>
      </div>

      <section className="stats" aria-label="Resumo" style={{ marginBottom: 32, background: '#fff' }}>
        <div className="grid">
          <div className="cell"><p className="big">{awaitingQuote}</p><p className="sub">aguardando orçamento</p></div>
          <div className="cell"><p className="big">{counts['orcamento_enviado'] ?? 0}</p><p className="sub">orçamentos sem resposta</p></div>
          <div className="cell"><p className="big">{inProgress}</p><p className="sub">em produção</p></div>
          <div className="cell"><p className="big" style={{ color: late ? 'var(--mark-text)' : undefined }}>{late}</p><p className="sub">com prazo vencido</p></div>
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <div className="filters" role="group" aria-label="Filtrar por status" style={{ marginBottom: 0 }}>
          {filters.map((f) => (
            <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span className="mono" style={{ opacity: 0.7 }}>{counts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="field" style={{ minWidth: 240, flex: '0 1 320px' }}>
          <label htmlFor="busca" className="sr-only">Buscar</label>
          <input id="busca" type="text" placeholder="Buscar código, nome, e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {!orders ? <Spinner /> : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Serviços</th><th>Status</th><th>Orçamento</th><th>Entrega</th><th>Recebido</th></tr></thead>
            <tbody>
              {visible.length === 0 && (<tr><td colSpan={7} className="empty">Nenhum pedido neste filtro.</td></tr>)}
              {visible.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/admin/pedidos/${o.id}`} className="mono" style={{ fontWeight: 500 }}>{o.code}</Link><div className="muted" style={{ fontSize: 13 }}>{o.document_type}{o.pages ? ` · ${o.pages} p.` : ''}</div></td>
                  <td>{o.profiles?.full_name || '—'}<div className="muted" style={{ fontSize: 13 }}>{o.profiles?.email}</div></td>
                  <td style={{ maxWidth: 260 }}>{o.services.map(serviceTitle).join(', ')}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="mono">{formatMoney(o.quote_amount)}</td>
                  <td className="mono">{formatDate(o.quote_deadline ?? o.desired_deadline)}</td>
                  <td className="mono muted">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

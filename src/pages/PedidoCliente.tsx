import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { whatsappLink } from '../config';
import { formatDate, formatMoney, requireDb, uploadOrderFiles } from '../lib/supabase';
import { errorMessage, useOrder } from '../lib/orders';
import { FileDrop, Spinner, StatusTracker } from '../components/ui';
import { FileGroup, OrderSummary, Timeline } from '../components/order';

export default function PedidoCliente() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data, error, loading, reload } = useOrder(id);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [extra, setExtra] = useState<File[]>([]);

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <main className="container app-page">
        <p className="alert error">{error || 'Pedido não encontrado.'}</p>
        <Link to="/conta">Voltar aos pedidos</Link>
      </main>
    );
  }

  const { order, files, events } = data;

  async function respond(accept: boolean) {
    if (!accept && !window.confirm('Recusar este orçamento e cancelar o pedido?')) return;
    setBusy(true);
    setActionError('');
    const { error } = await requireDb().rpc('respond_quote', { p_order: order.id, p_accept: accept });
    setBusy(false);
    if (error) setActionError(errorMessage(error));
    else reload();
  }

  async function sendExtra() {
    setBusy(true);
    setActionError('');
    try {
      await uploadOrderFiles(order.id, 'original', extra);
      setExtra([]);
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const canAddFiles = !['entregue', 'cancelado'].includes(order.status);

  return (
    <main className="container app-page">
      <p style={{ margin: '0 0 16px' }}><Link to="/conta">← Meus pedidos</Link></p>
      <div className="app-title">
        <div>
          <p className="kicker">Pedido</p>
          <h1 className="h-display h2 mono" style={{ fontFamily: 'var(--display)' }}>{order.code}</h1>
        </div>
        <a className="btn" href={whatsappLink(`Olá! Tenho uma dúvida sobre o pedido ${order.code}.`)} target="_blank" rel="noreferrer">Falar sobre este pedido</a>
      </div>

      {params.get('novo') && (
        <div className="alert ok" role="status" style={{ marginBottom: 20 }}>
          Pedido recebido! Você vai receber o orçamento por aqui e pelo WhatsApp. Guarde o código <strong className="mono">{order.code}</strong>.
        </div>
      )}

      <div className="panel" style={{ marginBottom: 20 }}>
        <StatusTracker status={order.status} />
      </div>

      {order.status === 'orcamento_enviado' && (
        <section className="panel" style={{ borderColor: 'var(--accent)', borderWidth: 2, marginBottom: 20 }} aria-labelledby="orc">
          <p id="orc" className="panel-title" style={{ color: 'var(--accent)' }}>Seu orçamento</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'end' }}>
            <div><p className="muted" style={{ margin: 0, fontSize: 14 }}>Valor</p><p className="h-display" style={{ fontSize: 44, margin: 0 }}>{formatMoney(order.quote_amount)}</p></div>
            <div><p className="muted" style={{ margin: 0, fontSize: 14 }}>Entrega até</p><p className="h-display" style={{ fontSize: 28, margin: 0 }}>{formatDate(order.quote_deadline)}</p></div>
          </div>
          {order.quote_message && <p style={{ whiteSpace: 'pre-wrap' }}>{order.quote_message}</p>}
          {actionError && <p className="alert error" role="alert">{actionError}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            <button className="btn btn-primary" disabled={busy} onClick={() => respond(true)}>Aprovar orçamento</button>
            <button className="btn" disabled={busy} onClick={() => respond(false)}>Recusar</button>
          </div>
        </section>
      )}

      <div className="cols">
        <div className="main">
          {order.status === 'entregue' && (
            <section className="panel" style={{ borderColor: 'var(--ok)', borderWidth: 2 }}>
              <p className="panel-title" style={{ color: 'var(--ok)' }}>Trabalho entregue</p>
              <FileGroup files={files} kind="entrega" empty="Os arquivos de entrega aparecerão aqui." />
            </section>
          )}
          <section className="panel">
            <p className="panel-title">Detalhes</p>
            <OrderSummary order={order} />
            {order.quote_amount != null && order.status !== 'orcamento_enviado' && (
              <dl className="kv" style={{ marginTop: 8 }}>
                <dt>Orçamento</dt><dd>{formatMoney(order.quote_amount)} · entrega até {formatDate(order.quote_deadline)}</dd>
              </dl>
            )}
          </section>
          <section className="panel">
            <p className="panel-title">Arquivos</p>
            <FileGroup files={files} kind="original" empty="Nenhum arquivo enviado." />
            <FileGroup files={files} kind="norma" />
            {order.status !== 'entregue' && <FileGroup files={files} kind="entrega" />}
            {canAddFiles && (
              <div style={{ marginTop: 20 }}>
                <FileDrop id="extra" label="Enviar mais arquivos" hint="Versão nova, figuras, template da revista…" files={extra} onChange={setExtra} />
                {extra.length > 0 && <button className="btn btn-dark" style={{ marginTop: 12 }} disabled={busy} onClick={sendExtra}>{busy ? 'Enviando…' : `Enviar ${extra.length} arquivo(s)`}</button>}
                {actionError && order.status !== 'orcamento_enviado' && <p className="alert error" role="alert">{actionError}</p>}
              </div>
            )}
          </section>
        </div>
        <aside className="side panel">
          <p className="panel-title">Histórico</p>
          <Timeline events={events} />
        </aside>
      </div>
    </main>
  );
}

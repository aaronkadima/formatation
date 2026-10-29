import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { STATUS, type OrderStatus } from '../lib/catalog';
import { formatMoney, requireDb, uploadOrderFiles } from '../lib/supabase';
import { errorMessage, useOrder } from '../lib/orders';
import { FileDrop, Spinner, StatusBadge, StatusTracker } from '../components/ui';
import { FileGroup, OrderSummary, Timeline } from '../components/order';

const onlyDigits = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '');

export default function AdminPedido() {
  const { id } = useParams();
  const { data, error, loading, reload } = useOrder(id);
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [note, setNote] = useState('');
  const [delivery, setDelivery] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    setAmount(data.order.quote_amount?.toString() ?? '');
    setDeadline(data.order.quote_deadline ?? '');
    setMessage(data.order.quote_message ?? '');
  }, [data]);

  useEffect(() => {
    if (!id) return;
    requireDb()
      .from('order_private')
      .select('admin_notes')
      .eq('order_id', id)
      .maybeSingle()
      .then(({ data: row }) => setNotes(row?.admin_notes ?? ''));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <main className="container app-page">
        <p className="alert error">{error || 'Pedido não encontrado.'}</p>
        <Link to="/admin">Voltar ao painel</Link>
      </main>
    );
  }

  const { order, files, events } = data;
  const client = order.profiles;
  const phone = onlyDigits(client?.phone);
  const waNumber = phone && !phone.startsWith('55') ? `55${phone}` : phone;
  const waText = (t: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(t)}`;
  const firstName = client?.full_name?.split(' ')[0] ?? '';

  async function run(action: () => PromiseLike<{ error: unknown } | void>, ok: string) {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await action();
      if (res && res.error) throw res.error;
      setFeedback({ ok: true, text: ok });
      await reload();
    } catch (e) {
      setFeedback({ ok: false, text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  const db = requireDb();

  function sendQuote(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(',', '.'));
    if (!value || value <= 0 || !deadline) {
      setFeedback({ ok: false, text: 'Informe valor e data de entrega.' });
      return;
    }
    run(
      () => db.from('orders').update({ quote_amount: value, quote_deadline: deadline, quote_message: message.trim() || null, status: 'orcamento_enviado' }).eq('id', order.id),
      'Orçamento enviado. O cliente já pode aprovar na área dele.',
    );
  }

  const setStatus = (status: OrderStatus) =>
    run(() => db.from('orders').update({ status }).eq('id', order.id), 'Status atualizado.');

  const saveNotes = () =>
    run(
      () => db.from('order_private').upsert({ order_id: order.id, admin_notes: notes.trim() || null, updated_at: new Date().toISOString() }),
      'Notas internas salvas.',
    );

  const addNote = (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    run(async () => {
      const r = await db.from('order_events').insert({ order_id: order.id, message: note.trim() });
      if (!r.error) setNote('');
      return r;
    }, 'Atualização publicada para o cliente.');
  };

  const deliver = (markDelivered: boolean) =>
    run(async () => {
      await uploadOrderFiles(order.id, 'entrega', delivery);
      setDelivery([]);
      if (markDelivered) return db.from('orders').update({ status: 'entregue' }).eq('id', order.id);
    }, markDelivered ? 'Entrega publicada e pedido marcado como entregue.' : 'Arquivos de entrega enviados.');

  return (
    <main className="container app-page">
      <p style={{ margin: '0 0 16px' }}><Link to="/admin">← Painel</Link></p>
      <div className="app-title">
        <div>
          <p className="kicker">Pedido · <StatusBadge status={order.status} /></p>
          <h1 className="h-display h2">{order.code}</h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <label htmlFor="status" className="sr-only">Alterar status</label>
          <select id="status" value={order.status} disabled={busy} onChange={(e) => setStatus(e.target.value as OrderStatus)} style={{ width: 'auto', background: '#fff' }}>
            {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {feedback && <p className={`alert ${feedback.ok ? 'ok' : 'error'}`} role="status" style={{ marginBottom: 20 }}>{feedback.text}</p>}

      <div className="panel" style={{ marginBottom: 20 }}><StatusTracker status={order.status} /></div>

      <div className="cols">
        <div className="main">
          <section className="panel">
            <p className="panel-title">Cliente</p>
            <dl className="kv">
              <dt>Nome</dt><dd>{client?.full_name || '—'}</dd>
              <dt>E-mail</dt><dd>{client?.email ? <a href={`mailto:${client.email}?subject=${encodeURIComponent(`Pedido ${order.code}`)}`}>{client.email}</a> : '—'}</dd>
              <dt>WhatsApp</dt><dd>{client?.phone || '—'}</dd>
              <dt>Instituição</dt><dd>{client?.institution || '—'}</dd>
            </dl>
            {waNumber && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                <a className="btn btn-sm" target="_blank" rel="noreferrer" href={waText(`Olá, ${firstName}! Recebemos seu pedido ${order.code} na formatation.`)}>WhatsApp: confirmar recebimento</a>
                {order.status === 'orcamento_enviado' && (
                  <a className="btn btn-sm" target="_blank" rel="noreferrer" href={waText(`Olá, ${firstName}! O orçamento do pedido ${order.code} está pronto: ${formatMoney(order.quote_amount)}. Você pode aprovar na sua área do cliente: ${window.location.origin}/conta/pedidos/${order.id}`)}>WhatsApp: avisar orçamento</a>
                )}
                {order.status === 'entregue' && (
                  <a className="btn btn-sm" target="_blank" rel="noreferrer" href={waText(`Olá, ${firstName}! Seu pedido ${order.code} foi entregue. Os arquivos estão na sua área do cliente: ${window.location.origin}/conta/pedidos/${order.id}`)}>WhatsApp: avisar entrega</a>
                )}
              </div>
            )}
          </section>

          <section className="panel">
            <p className="panel-title">Pedido</p>
            <OrderSummary order={order} />
          </section>

          <form className="panel" onSubmit={sendQuote}>
            <p className="panel-title">Orçamento</p>
            <div className="form-grid">
              <div className="field"><label htmlFor="q-amount">Valor (R$)</label><input id="q-amount" type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="450,00" /></div>
              <div className="field"><label htmlFor="q-deadline">Entrega até</label><input id="q-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
              <div className="field full"><label htmlFor="q-msg">Mensagem ao cliente</label><textarea id="q-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="O que está incluído, forma de pagamento, condições…" /></div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={busy}>
              {order.status === 'recebido' ? 'Enviar orçamento' : 'Atualizar e reenviar orçamento'}
            </button>
          </form>

          <section className="panel">
            <p className="panel-title">Arquivos</p>
            <FileGroup files={files} kind="original" empty="Cliente ainda não enviou arquivos." />
            <FileGroup files={files} kind="norma" />
            <FileGroup files={files} kind="entrega" empty="Nenhuma entrega publicada." />
            <div style={{ marginTop: 20 }}>
              <FileDrop id="delivery" label="Publicar entrega" hint="Arquivo final, PDF de conferência, relatório de ajustes, declaração" files={delivery} onChange={setDelivery} />
              {delivery.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn btn-primary" disabled={busy} onClick={() => deliver(true)}>Enviar e marcar como entregue</button>
                  <button type="button" className="btn" disabled={busy} onClick={() => deliver(false)}>Só enviar arquivos</button>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="side">
          <form className="panel" onSubmit={addNote}>
            <p className="panel-title">Atualização para o cliente</p>
            <div className="field"><label htmlFor="note" className="sr-only">Mensagem</label><textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: capítulos 1 a 3 concluídos." style={{ minHeight: 80 }} /></div>
            <button className="btn btn-dark btn-sm" style={{ marginTop: 10 }} disabled={busy || !note.trim()}>Publicar no histórico</button>
          </form>
          <div className="panel">
            <p className="panel-title">Histórico</p>
            <Timeline events={events} />
          </div>
          <div className="panel">
            <p className="panel-title">Notas internas</p>
            <div className="field"><label htmlFor="notes" className="sr-only">Notas internas</label><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Só a equipe vê." /></div>
            <button type="button" className="btn btn-sm" style={{ marginTop: 10 }} disabled={busy} onClick={saveNotes}>Salvar notas</button>
          </div>
        </aside>
      </div>
    </main>
  );
}

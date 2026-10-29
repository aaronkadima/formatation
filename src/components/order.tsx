import { useState } from 'react';
import { serviceTitle } from '../lib/catalog';
import { downloadUrl, formatDate, formatSize, type FileKind, type Order, type OrderEvent, type OrderFile } from '../lib/supabase';
import { errorMessage } from '../lib/orders';
import { DownloadIcon } from './ui';

const KIND_LABEL: Record<FileKind, string> = {
  original: 'Arquivos enviados',
  norma: 'Normas e manuais',
  entrega: 'Entrega',
};

export function FileGroup({ files, kind, empty }: { files: OrderFile[]; kind: FileKind; empty?: string }) {
  const [error, setError] = useState('');
  const list = files.filter((f) => f.kind === kind);
  if (!list.length && !empty) return null;

  async function open(f: OrderFile) {
    try {
      setError('');
      window.location.href = await downloadUrl(f.path);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <p className="label" style={{ margin: '0 0 6px' }}>{KIND_LABEL[kind]}</p>
      {list.length === 0 ? (
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>{empty}</p>
      ) : (
        <ul className="file-list" style={{ marginTop: 0 }}>
          {list.map((f) => (
            <li key={f.id}>
              <span className="name">{f.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="mono muted">{formatSize(f.size)}</span>
                <button type="button" className="btn btn-sm" onClick={() => open(f)} aria-label={`Baixar ${f.name}`}><DownloadIcon /> Baixar</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="alert error" role="alert">{error}</p>}
    </div>
  );
}

export function Timeline({ events }: { events: OrderEvent[] }) {
  if (!events.length) return <p className="muted">Sem movimentações ainda.</p>;
  return (
    <ol className="timeline">
      {[...events].reverse().map((ev) => (
        <li key={ev.id}>
          <time dateTime={ev.created_at}>{new Date(ev.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</time>
          {ev.message}
        </li>
      ))}
    </ol>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  return (
    <dl className="kv">
      <dt>Documento</dt><dd>{order.document_type ?? '—'}{order.pages ? ` · ~${order.pages} páginas` : ''}</dd>
      <dt>Norma</dt><dd>{order.norm ?? '—'}</dd>
      <dt>Plano</dt><dd style={{ textTransform: 'capitalize' }}>{order.plan?.replace('-', ' ') ?? '—'}</dd>
      <dt>Serviços</dt><dd>{order.services.map((s) => <div key={s}>{s} · {serviceTitle(s)}</div>)}</dd>
      <dt>Prazo desejado</dt><dd>{formatDate(order.desired_deadline)}</dd>
      <dt>Pedido em</dt><dd>{formatDate(order.created_at)}</dd>
      {order.notes && (<><dt>Observações</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{order.notes}</dd></>)}
    </dl>
  );
}

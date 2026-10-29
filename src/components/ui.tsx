import { useRef, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { STATUS, statusLabel, type OrderStatus } from '../lib/catalog';
import { MAX_FILE_MB, formatSize, supabase } from '../lib/supabase';

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const ArrowIcon = () => (<svg {...svg}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const CheckIcon = () => (<svg {...svg} width={24} height={24} strokeWidth={1.8}><path d="M4 12l5 5L20 6" /></svg>);
export const LockIcon = () => (<svg {...svg} width={24} height={24} strokeWidth={1.8}><rect x="5" y="10" width="14" height="10" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>);
export const DocIcon = () => (<svg {...svg} width={24} height={24} strokeWidth={1.8}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>);
export const ClockIcon = () => (<svg {...svg} width={24} height={24} strokeWidth={1.8}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>);
export const UploadIcon = () => (<svg {...svg} width={28} height={28}><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>);
export const DownloadIcon = () => (<svg {...svg} width={16} height={16}><path d="M12 4v12M7 11l5 5 5-5M5 20h14" /></svg>);

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="center" role="status">
      <div className="spinner" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${status}`}>{statusLabel(status)}</span>;
}

const FLOW = STATUS.filter((s) => s.id !== 'cancelado');

export function StatusTracker({ status }: { status: OrderStatus }) {
  if (status === 'cancelado') return <StatusBadge status={status} />;
  const idx = FLOW.findIndex((s) => s.id === status);
  return (
    <div aria-label={`Etapa ${idx + 1} de ${FLOW.length}: ${statusLabel(status)}`}>
      <div className="tracker" aria-hidden="true">
        {FLOW.map((s, i) => (<div key={s.id} className={i <= idx ? 'done' : ''} />))}
      </div>
      <div className="tracker-labels" aria-hidden="true">
        {FLOW.map((s) => (<span key={s.id}>{s.label}</span>))}
      </div>
    </div>
  );
}

export function FileDrop({
  id,
  label,
  hint,
  files,
  onChange,
  accept,
}: {
  id: string;
  label: string;
  hint?: string;
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
}) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function add(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const tooBig = incoming.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    setError(tooBig.length ? `Arquivo acima de ${MAX_FILE_MB} MB: ${tooBig.map((f) => f.name).join(', ')}` : '');
    onChange([...files, ...incoming.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024)]);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="field full">
      <span className="label" id={`${id}-label`}>{label}</span>
      <label
        htmlFor={id}
        className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      >
        <input ref={inputRef} id={id} type="file" multiple accept={accept} aria-labelledby={`${id}-label`} onChange={(e) => add(e.target.files)} />
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <UploadIcon />
          <strong>Arraste aqui ou clique para escolher</strong>
          {hint && <span className="hint muted" style={{ fontSize: 13 }}>{hint}</span>}
        </span>
      </label>
      {error && <p className="alert error" role="alert" style={{ margin: '8px 0 0' }}>{error}</p>}
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span className="name">{f.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="mono muted">{formatSize(f.size)}</span>
                <button type="button" className="link-btn" onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label={`Remover ${f.name}`}>remover</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RequireAuth({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const { ready, session, isAdmin } = useAuth();
  const location = useLocation();
  if (!supabase) return <Navigate to="/pedido" replace />;
  if (!ready) return <Spinner />;
  if (!session) return <Navigate to={`/entrar?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (admin && !isAdmin) {
    return (
      <main className="container app-page">
        <h1 className="h-display h2">Acesso restrito</h1>
        <p className="lead">Esta área é só para a equipe formatation.</p>
      </main>
    );
  }
  return <>{children}</>;
}

import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { whatsappLink } from '../config';
import { DOC_TYPES, GROUPS, NORMS, PLANS, SERVICES, serviceTitle, type ServiceGroup } from '../lib/catalog';
import { useAuth } from '../lib/auth';
import { supabase, uploadOrderFiles } from '../lib/supabase';
import { errorMessage } from '../lib/orders';
import { ArrowIcon, FileDrop, Spinner } from '../components/ui';
import { EmailLogin } from './Entrar';

interface FormState {
  full_name: string;
  phone: string;
  institution: string;
  document_type: string;
  norm: string;
  pages: string;
  desired_deadline: string;
  plan: string;
  services: string[];
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function Pedido() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { ready, session, profile, refreshProfile } = useAuth();
  const initialPlan = PLANS.some((p) => p.id === params.get('plano')) ? params.get('plano')! : 'completo';

  const [form, setForm] = useState<FormState>({
    full_name: '',
    phone: '',
    institution: '',
    document_type: 'Dissertação',
    norm: 'ABNT',
    pages: '',
    desired_deadline: '',
    plan: initialPlan,
    services: ['A1'],
    notes: '',
  });
  const [originals, setOriginals] = useState<File[]>([]);
  const [norms, setNorms] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [waUrl, setWaUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        full_name: f.full_name || profile.full_name || '',
        phone: f.phone || profile.phone || '',
        institution: f.institution || profile.institution || '',
      }));
    }
  }, [profile]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleService = (id: string) =>
    set('services', form.services.includes(id) ? form.services.filter((s) => s !== id) : [...form.services, id]);

  function whatsappMessage() {
    return [
      'Olá! Gostaria de um orçamento.',
      `Nome: ${form.full_name}`,
      form.institution && `Instituição: ${form.institution}`,
      `Documento: ${form.document_type}${form.pages ? ` (~${form.pages} páginas)` : ''}`,
      `Norma: ${form.norm}`,
      `Plano: ${PLANS.find((p) => p.id === form.plan)?.name}`,
      `Serviços: ${form.services.map(serviceTitle).join('; ')}`,
      form.desired_deadline && `Prazo desejado: ${new Date(form.desired_deadline + 'T12:00').toLocaleDateString('pt-BR')}`,
      form.notes && `Observações: ${form.notes}`,
    ].filter(Boolean).join('\n');
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.services.length === 0) return setError('Escolha pelo menos um serviço.');

    if (!supabase) {
      setWaUrl(whatsappLink(whatsappMessage()));
      return;
    }
    if (originals.length === 0) return setError('Anexe o arquivo do seu trabalho.');

    setBusy(true);
    try {
      const prof = await supabase
        .from('profiles')
        .update({ full_name: form.full_name.trim(), phone: form.phone.trim(), institution: form.institution.trim() || null })
        .eq('id', session!.user.id);
      if (prof.error) throw prof.error;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          services: form.services,
          plan: form.plan,
          document_type: form.document_type,
          norm: form.norm,
          pages: form.pages ? Number(form.pages) : null,
          desired_deadline: form.desired_deadline || null,
          notes: form.notes.trim() || null,
        })
        .select('id')
        .single();
      if (error) throw error;

      await uploadOrderFiles(data.id, 'original', originals);
      if (norms.length) await uploadOrderFiles(data.id, 'norma', norms);
      await refreshProfile();
      navigate(`/conta/pedidos/${data.id}?novo=1`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (supabase && !ready) return <Spinner />;

  const needsLogin = !!supabase && !session;

  return (
    <main className="container app-page">
      <div className="app-title">
        <div>
          <p className="kicker">Novo pedido</p>
          <h1 className="h-display h2">Peça seu orçamento.</h1>
        </div>
        <p className="muted" style={{ maxWidth: 380, margin: 0 }}>Gratuito e sem compromisso. Você recebe preço e prazo fechados e só aprova se quiser.</p>
      </div>

      {needsLogin ? (
        <div className="panel" style={{ maxWidth: 640 }}>
          <p className="panel-title">Passo 1 de 2 · Confirme seu e-mail</p>
          <p style={{ marginTop: 0 }}>Para enviar seus arquivos com segurança e acompanhar o pedido, confirme seu e-mail. Leva 30 segundos.</p>
          <EmailLogin next={`/pedido?plano=${form.plan}`} compact />
          <p className="muted" style={{ fontSize: 14, marginBottom: 0 }}>Prefere conversar? <a href={whatsappLink('Olá! Gostaria de um orçamento.')} target="_blank" rel="noreferrer">Fale no WhatsApp</a>.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate={false}>
          <div className="panel">
            <p className="panel-title">{supabase ? 'Passo 2 de 2 · ' : ''}Seus dados</p>
            <div className="form-grid">
              <div className="field"><label htmlFor="full_name">Nome completo</label><input id="full_name" type="text" required autoComplete="name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} /></div>
              <div className="field"><label htmlFor="phone">WhatsApp</label><input id="phone" type="tel" required autoComplete="tel" placeholder="(91) 99999-9999" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
              <div className="field"><label htmlFor="institution">Instituição <span className="muted">(opcional)</span></label><input id="institution" type="text" value={form.institution} onChange={(e) => set('institution', e.target.value)} /></div>
            </div>
          </div>

          <div className="panel">
            <p className="panel-title">O trabalho</p>
            <div className="form-grid">
              <div className="field"><label htmlFor="document_type">Tipo de documento</label><select id="document_type" value={form.document_type} onChange={(e) => set('document_type', e.target.value)}>{DOC_TYPES.map((d) => <option key={d}>{d}</option>)}</select></div>
              <div className="field"><label htmlFor="norm">Norma</label><select id="norm" value={form.norm} onChange={(e) => set('norm', e.target.value)}>{NORMS.map((n) => <option key={n}>{n}</option>)}</select></div>
              <div className="field"><label htmlFor="pages">Nº aproximado de páginas</label><input id="pages" type="number" min={1} inputMode="numeric" value={form.pages} onChange={(e) => set('pages', e.target.value)} /></div>
              <div className="field"><label htmlFor="deadline">Prazo desejado <span className="muted">(opcional)</span></label><input id="deadline" type="date" min={today()} value={form.desired_deadline} onChange={(e) => set('desired_deadline', e.target.value)} /></div>
            </div>

            <fieldset style={{ border: 0, padding: 0, margin: '24px 0 0' }}>
              <legend className="label" style={{ marginBottom: 8 }}>Plano</legend>
              <div className="radio-row">
                {PLANS.map((p) => (
                  <label key={p.id} className="check"><input type="radio" name="plan" value={p.id} checked={form.plan === p.id} onChange={() => set('plan', p.id)} />{p.name}</label>
                ))}
              </div>
            </fieldset>

            <fieldset style={{ border: 0, padding: 0, margin: '24px 0 0' }}>
              <legend className="label" style={{ marginBottom: 8 }}>Serviços</legend>
              {(Object.keys(GROUPS) as ServiceGroup[]).map((g) => (
                <div key={g} style={{ marginBottom: 16 }}>
                  <p className="mono muted" style={{ fontSize: 12, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{g} · {GROUPS[g]}</p>
                  <div className="check-grid">
                    {SERVICES.filter((s) => s.group === g).map((s) => (
                      <label key={s.id} className="check">
                        <input type="checkbox" checked={form.services.includes(s.id)} onChange={() => toggleService(s.id)} />
                        <span><small>{s.id}</small>{s.title}<small style={{ marginTop: 4 }}>{s.price}</small></span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>

            <div className="field full" style={{ marginTop: 8 }}>
              <label htmlFor="notes">Observações</label>
              <textarea id="notes" placeholder="Ex.: o manual da universidade pede fonte Arial; a defesa é dia 20." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>

          {supabase ? (
            <div className="panel">
              <p className="panel-title">Arquivos</p>
              <div className="form-grid">
                <FileDrop id="originals" label="Seu trabalho *" hint="Word, LaTeX (.zip), PDF ou Google Docs exportado · até 50 MB por arquivo" files={originals} onChange={setOriginals} />
                <FileDrop id="norms" label="Norma ou manual (opcional)" hint="Manual da instituição, guia para autores ou template da revista" files={norms} onChange={setNorms} />
              </div>
            </div>
          ) : (
            <div className="alert info" style={{ marginTop: 20 }}>Os arquivos são enviados pelo WhatsApp depois que você mandar a mensagem com os dados do pedido.</div>
          )}

          {error && <p className="alert error" role="alert" style={{ marginTop: 20 }}>{error}</p>}

          {waUrl && (
            <div className="alert ok" role="status" style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Mensagem pronta com os dados do pedido. Abra o WhatsApp para enviar e anexe seus arquivos lá.</span>
              <a className="btn btn-primary btn-sm" href={waUrl} target="_blank" rel="noreferrer">Abrir no WhatsApp</a>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginTop: 24 }}>
            <button className="btn btn-primary" disabled={busy} style={{ minHeight: 56 }}>
              {busy ? 'Enviando arquivos…' : supabase ? 'Enviar pedido' : waUrl ? 'Atualizar mensagem' : 'Preparar mensagem no WhatsApp'} {!busy && <ArrowIcon />}
            </button>
            <span className="muted" style={{ fontSize: 14 }}>{supabase ? 'Seu texto fica em armazenamento privado. ' : ''}<Link to="/#faq">Dúvidas?</Link></span>
          </div>
        </form>
      )}
    </main>
  );
}

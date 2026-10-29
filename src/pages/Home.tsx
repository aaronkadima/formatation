import { Link } from 'react-router-dom';
import { BUSINESS, DEADLINES, PRICING, whatsappLink } from '../config';
import { GROUPS, SERVICES, type ServiceGroup } from '../lib/catalog';
import { ArrowIcon, CheckIcon, ClockIcon, DocIcon, LockIcon } from '../components/ui';

function AnnotatedSheet() {
  return (
    <figure className="hero-art" aria-label="Ilustração de uma página com marcações de margem e espaçamento ABNT">
      <div className="sheet-wrap">
        <div className="sheet" aria-hidden="true">
          <div className="guide" />
          <div className="body">
            <div className="ttl" />
            <div className="ln" />
            <div className="ln" style={{ width: '96%' }} />
            <div className="ln" />
            <div className="ln" style={{ width: '72%' }} />
            <div className="tbl"><span /><span /><span /></div>
            <div className="cap" />
            <div className="ln" style={{ marginTop: 8 }} />
            <div className="ln" style={{ width: '94%' }} />
            <div className="ln" style={{ width: '58%' }} />
          </div>
          <span className="measure" style={{ left: '50%', top: '2.5%', transform: 'translateX(-50%)' }}>3 cm</span>
          <span className="measure" style={{ left: '2%', top: '48%', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>3 cm</span>
          <span className="measure" style={{ right: '1.5%', top: '48%', writingMode: 'vertical-rl' }}>2 cm</span>
          <span className="mono muted" style={{ position: 'absolute', right: '6%', bottom: '2.5%', fontSize: 10 }}>17</span>
        </div>
        <div aria-hidden="true" className="sheet-tag" style={{ left: 0, top: '46%', background: 'var(--mark)', color: '#fff', transform: 'rotate(-4deg)' }}>Tabela 2 — fonte 10</div>
        <div aria-hidden="true" className="sheet-tag" style={{ right: -8, top: 0, background: 'var(--ink)', color: 'var(--paper)' }}>Times 12 · 1,5 · just.</div>
      </div>
    </figure>
  );
}

const FAQ = [
  ['Vocês alteram o conteúdo do meu trabalho?', 'Não. A formatação mexe só na forma. Mudanças no texto acontecem apenas nos serviços de revisão e tradução, sempre com controle de alterações para você aprovar.'],
  ['Em quais formatos vocês trabalham?', 'Word, Google Docs e LaTeX (Overleaf). A entrega vem no mesmo formato, mais um PDF de conferência.'],
  ['Qual é o prazo?', `Formatação: 3 dias úteis para artigo ou TCC, ${BUSINESS.avgDays} para dissertação e 7 para tese. Urgência em 24 ou 48 horas tem acréscimo. O prazo exato vem fechado no orçamento.`],
  ['Atendem qualquer área?', 'Sim para formatação. Em tradução e figuras técnicas, a especialidade é engenharia e ciências exatas; outras áreas, sob consulta.'],
  ['Como acompanho meu pedido?', 'Pela área do cliente: você entra com um link enviado ao seu e-mail, vê o orçamento, aprova e baixa a entrega — sem senha.'],
  ['Como é o pagamento?', BUSINESS.payment],
];

export default function Home() {
  return (
    <main>
      <section className="container hero" id="topo">
        <div className="hero-copy">
          <p className="kicker muted">Formatação · Tradução · Publicação acadêmica</p>
          <h1 className="h-display h1">Seu trabalho nas normas.<br /><span className="accent">Pronto para a banca</span> e para a revista.</h1>
          <p className="lead" style={{ marginTop: 28 }}>Formatação ABNT, APA, Vancouver e normas de periódicos, tradução para o inglês, figuras técnicas e submissão assistida — feitos por quem publica artigos científicos, não por um robô de template.</p>
          <div className="cta-row">
            <Link to="/pedido" className="btn btn-primary" style={{ minHeight: 52 }}>Receber orçamento grátis <ArrowIcon /></Link>
            <Link to="/#servicos" className="btn" style={{ minHeight: 52 }}>Ver todos os serviços</Link>
          </div>
        </div>
        <AnnotatedSheet />
      </section>

      <section className="stats" aria-label="Credenciais">
        <div className="container grid" style={{ paddingInline: 0 }}>
          <div className="cell"><p className="big">Doutor</p><p className="sub">em Engenharia Civil (UFPA) — quem formata também pesquisa</p></div>
          <div className="cell"><p className="big">20+</p><p className="sub">artigos próprios publicados em periódicos indexados</p></div>
          <div className="cell"><p className="big">4 normas</p><p className="sub">ABNT · APA 7 · Vancouver · IEEE — e o guia da sua revista</p></div>
          <div className="cell"><p className="big">{BUSINESS.quoteHours} h</p><p className="sub">para responder seu orçamento</p></div>
        </div>
      </section>

      <section id="servicos" className="container section" style={{ paddingBottom: 40 }}>
        <div className="section-head">
          <div style={{ maxWidth: 680 }}>
            <p className="kicker">01 — Serviços</p>
            <h2 className="h-display h2">Do primeiro rascunho ao aceite da revista.</h2>
          </div>
          <p style={{ margin: 0, maxWidth: 380, color: 'var(--ink-2)' }}>Contrate um serviço avulso ou combine vários. Os marcados com <span className="tag">EXCLUSIVO</span> você não encontra em agências de revisão.</p>
        </div>
        {(Object.keys(GROUPS) as ServiceGroup[]).map((g) => (
          <div key={g}>
            <h3 className="group-title">{g} · {GROUPS[g]}</h3>
            <div className="svc-grid">
              {SERVICES.filter((s) => s.group === g).map((s) => (
                <article key={s.id} className="svc">
                  <div className="svc-top"><span>{s.id}</span>{s.exclusive && <span className="tag">EXCLUSIVO</span>}</div>
                  <h4 className="h3">{s.title}</h4>
                  <p>{s.description}</p>
                  <dl className="svc-meta">
                    <div><dt>Preço</dt><dd>{s.price}</dd></div>
                    <div><dt>Prazo</dt><dd>{s.deadline}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="planos" className="container section" style={{ paddingTop: 40 }}>
        <p className="kicker">02 — Planos de formatação</p>
        <h2 className="h-display h2" style={{ maxWidth: 760, marginBottom: 48 }}>Escolha o nível de cuidado. O preço sai por página.</h2>
        <div className="plans">
          <div className="plan">
            <div><h3 className="name">Essencial</h3><p className="desc muted" style={{ margin: '6px 0 0' }}>Para quem precisa entregar dentro da norma.</p></div>
            <p className="price">R$ {PRICING.essencial}<small> /página</small></p>
            <ul><li>Formatação completa na norma escolhida</li><li>Sumário, listas e numeração automáticos</li><li>Referências padronizadas</li><li>1 rodada de ajustes</li></ul>
            <Link to="/pedido?plano=essencial" className="btn">Escolher Essencial</Link>
          </div>
          <div className="plan dark">
            <span className="plan-badge">MAIS PEDIDO</span>
            <div><h3 className="name">Completo</h3><p className="desc" style={{ margin: '6px 0 0' }}>Para defesa, depósito e submissão sem surpresas.</p></div>
            <p className="price">R$ {PRICING.completo}<small> /página</small></p>
            <ul><li>Tudo do Essencial</li><li>Tabelas e figuras padronizadas</li><li>Conferência citação × referência</li><li>Template editável para continuar escrevendo</li><li>Ajustes até a versão final ({BUSINESS.revisionWindow})</li></ul>
            <Link to="/pedido?plano=completo" className="btn btn-light">Escolher Completo</Link>
          </div>
          <div className="plan dashed">
            <div><h3 className="name">Sob medida</h3><p className="desc muted" style={{ margin: '6px 0 0' }}>Combine formatação com idioma e apresentação.</p></div>
            <p className="price">Combine<small> serviços</small></p>
            <ul><li>Tradução e revisão de inglês</li><li>Slides, pôster e resumo gráfico</li><li>Submissão assistida e resposta aos revisores</li><li>Pacotes para grupos de pesquisa</li></ul>
            <Link to="/pedido?plano=sob-medida" className="btn btn-primary">Montar meu pacote</Link>
          </div>
        </div>
        <div className="plan-terms">
          <div>
            <p className="label">Prazos de formatação</p>
            <ul>{DEADLINES.map((d) => <li key={d.doc}><span>{d.doc}</span><strong>{d.days}</strong></li>)}</ul>
          </div>
          <div>
            <p className="label">Condições</p>
            <ul>
              <li><span>Pedido mínimo</span><strong>{PRICING.minimum}</strong></li>
              <li><span>Urgência em 48 h</span><strong>{PRICING.urgency48}</strong></li>
              <li><span>Urgência em 24 h</span><strong>{PRICING.urgency24}</strong></li>
            </ul>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 14, gridColumn: '1 / -1' }}>Contamos todas as páginas do arquivo, inclusive capa, sumário e referências. O orçamento final vem fechado antes de começarmos.</p>
        </div>
      </section>

      <section id="processo" className="dark-band">
        <div className="container section">
          <p className="kicker" style={{ color: 'var(--accent-soft)' }}>03 — Como funciona</p>
          <h2 className="h-display h2" style={{ maxWidth: 720, marginBottom: 56 }}>Quatro passos. Você só aprova.</h2>
          <ol className="steps">
            <li><p className="num">01</p><h3 className="h3">Envie o arquivo</h3><p>Faça o pedido no site com o texto e a norma (manual da instituição ou guia da revista).</p></li>
            <li><p className="num">02</p><h3 className="h3">Receba o orçamento</h3><p>Preço fechado e prazo de entrega em até {BUSINESS.quoteHours} horas, sem compromisso.</p></li>
            <li><p className="num">03</p><h3 className="h3">Formatamos</h3><p>Ajustamos a forma sem tocar no seu conteúdo científico. Você acompanha cada etapa na área do cliente.</p></li>
            <li><p className="num">04</p><h3 className="h3">Entrega com relatório</h3><p>Arquivo final em Word, LaTeX ou PDF e uma lista do que foi ajustado — útil para a banca e o orientador.</p></li>
          </ol>
        </div>
      </section>

      <section className="container section split">
        <div className="main">
          <p className="kicker">04 — Antes e depois</p>
          <h2 className="h-display" style={{ fontSize: 'clamp(30px, 3.4vw, 46px)', marginBottom: 32 }}>Veja o que muda numa página.</h2>
          <div className="ba">
            <figure>
              <div className="pg" aria-hidden="true" style={{ border: '1px solid var(--line-2)' }}>
                <div style={{ height: 9, width: '48%', background: '#8E9097' }} />
                <div style={{ height: 5, width: '88%', background: 'var(--line)' }} />
                <div style={{ height: 5, width: '100%', background: 'var(--line)', marginLeft: '6%' }} />
                <div style={{ height: 5, width: '70%', background: 'var(--line)' }} />
                <div style={{ height: 46, width: '80%', background: '#E6E5E0', margin: '6px 0 0 12%' }} />
                <div style={{ height: 5, width: '92%', background: 'var(--line)', marginTop: 6 }} />
                <div style={{ height: 5, width: '60%', background: 'var(--line)' }} />
                <span style={{ position: 'absolute', top: '18%', right: '6%', width: 26, height: 26, border: '2px solid var(--mark)', borderRadius: '50%' }} />
                <span style={{ position: 'absolute', top: '52%', left: '4%', width: 26, height: 26, border: '2px solid var(--mark)', borderRadius: '50%' }} />
              </div>
              <figcaption style={{ color: 'var(--mark-text)' }}>Antes · margens e recuos irregulares</figcaption>
            </figure>
            <figure>
              <div className="pg" aria-hidden="true" style={{ border: '1px solid var(--ink)' }}>
                <div style={{ height: 9, width: '52%', background: 'var(--ink)', margin: '0 auto 6px' }} />
                <div style={{ height: 5, background: 'var(--line-2)' }} />
                <div style={{ height: 5, background: 'var(--line-2)' }} />
                <div style={{ height: 5, width: '74%', background: 'var(--line-2)' }} />
                <div style={{ height: 46, border: '1px solid var(--ink)', marginTop: 6 }} />
                <div style={{ height: 4, width: '36%', background: '#8E9097', margin: '0 auto' }} />
                <div style={{ height: 5, background: 'var(--line-2)', marginTop: 6 }} />
              </div>
              <figcaption className="accent">Depois · NBR 14724 aplicada</figcaption>
            </figure>
          </div>
          <a href={whatsappLink('Olá! Gostaria de uma página de amostra formatada gratuitamente.')} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, fontWeight: 600, minHeight: 44 }}>Pedir uma página de amostra grátis <ArrowIcon /></a>
        </div>
        <div className="side guarantee">
          <p className="kicker muted">Garantia formatation</p>
          <h3 className="h-display" style={{ fontSize: 30, lineHeight: 1.08, marginBottom: 28 }}>Se a banca ou a revista pedir ajuste de forma, refazemos.</h3>
          <div className="g-item"><CheckIcon /><div><strong>Ajustes incluídos</strong><p>Correções de formatação apontadas pela banca ou pelo editor sem custo por {BUSINESS.revisionWindow}.</p></div></div>
          <div className="g-item"><LockIcon /><div><strong>Sigilo total</strong><p>Seu texto não é compartilhado nem reutilizado. Arquivos ficam em armazenamento privado.</p></div></div>
          <div className="g-item"><DocIcon /><div><strong>Declaração de formatação</strong><p>Documento atestando o serviço, para anexar ao depósito ou à submissão.</p></div></div>
          <div className="g-item"><ClockIcon /><div><strong>Prazo cumprido</strong><p>Data de entrega fechada no orçamento. Urgência sob consulta.</p></div></div>
        </div>
      </section>

      <section aria-label="Depoimentos" style={{ borderBlock: '1px solid var(--ink)' }}>
        <div className="container quotes">
          <blockquote><p>“[Depoimento real de um cliente sobre a formatação da dissertação.]”</p><footer><strong style={{ color: 'var(--ink)' }}>[Nome]</strong> · [Mestrado em …, Universidade]</footer></blockquote>
          <blockquote><p>“[Depoimento real sobre tradução ou submissão de artigo.]”</p><footer><strong style={{ color: 'var(--ink)' }}>[Nome]</strong> · [Doutorado em …, Universidade]</footer></blockquote>
          <blockquote><p>“[Depoimento real sobre slides de defesa ou pôster.]”</p><footer><strong style={{ color: 'var(--ink)' }}>[Nome]</strong> · [Graduação em …, Universidade]</footer></blockquote>
        </div>
      </section>

      <section id="faq" className="container section split" style={{ gap: 48 }}>
        <div style={{ flex: '1 1 300px' }}>
          <p className="kicker">05 — Dúvidas</p>
          <h2 className="h-display h2">Perguntas frequentes</h2>
        </div>
        <div className="main faq">
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="container inner">
          <div style={{ maxWidth: 720 }}>
            <h2 className="h-display" style={{ fontSize: 'clamp(38px, 5vw, 72px)', lineHeight: 0.98, letterSpacing: '-0.035em' }}>Mande seu arquivo. A gente cuida da norma.</h2>
            <p style={{ margin: '20px 0 0', fontSize: 18, color: '#E4E8FF' }}>Orçamento gratuito em até {BUSINESS.quoteHours} horas.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 260 }}>
            <Link to="/pedido" className="btn btn-light" style={{ minHeight: 56, justifyContent: 'space-between' }}>Fazer pedido no site <ArrowIcon /></Link>
            <a href={whatsappLink('Olá! Gostaria de um orçamento.')} target="_blank" rel="noreferrer" className="btn btn-ghost-light" style={{ minHeight: 56 }}>Falar no WhatsApp</a>
          </div>
        </div>
      </section>
    </main>
  );
}

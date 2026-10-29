export type ServiceGroup = 'A' | 'B' | 'C';

export interface Service {
  id: string;
  group: ServiceGroup;
  title: string;
  description: string;
  exclusive?: boolean;
}

export const GROUPS: Record<ServiceGroup, string> = {
  A: 'Formatação e normalização',
  B: 'Idioma e publicação',
  C: 'Apresentação e divulgação',
};

export const SERVICES: Service[] = [
  { id: 'A1', group: 'A', exclusive: true, title: 'TCC, dissertação e tese na ABNT', description: 'NBR 14724 completa: capa, folha de rosto, sumário e listas automáticos, numeração, títulos, citações e o manual da sua instituição.' },
  { id: 'A2', group: 'A', title: 'Artigo nas normas da revista', description: 'Adequação ao guia para autores e ao template do periódico — Elsevier, Springer, MDPI, SciELO, IEEE e outros.' },
  { id: 'A3', group: 'A', exclusive: true, title: 'Referências e citações', description: 'NBR 6023 e 10520, APA, Vancouver. Conferência citação × lista e organização da sua base no Zotero ou Mendeley.' },
  { id: 'A4', group: 'A', title: 'Tabelas, quadros e figuras', description: 'Padronização de legendas, fontes, numeração e resolução, tabelas no padrão IBGE e figuras prontas para impressão.' },
  { id: 'A5', group: 'A', exclusive: true, title: 'Templates Word e LaTeX', description: 'Modelo com estilos prontos, ou projeto Overleaf com abnTeX2 — para você continuar escrevendo já formatado.' },
  { id: 'B1', group: 'B', title: 'Tradução acadêmica PT → EN', description: 'Tradução técnica com a terminologia da sua área, seguida de revisão do inglês. Envie seu glossário e a lista de referências.' },
  { id: 'B2', group: 'B', title: 'Revisão de texto', description: 'Português ou inglês: gramática, coesão e clareza, sempre com controle de alterações para você aprovar cada mudança.' },
  { id: 'B3', group: 'B', exclusive: true, title: 'Cover letter e resposta aos revisores', description: 'Carta ao editor na submissão e, depois, a carta ponto a ponto respondendo aos pareceristas na revisão.' },
  { id: 'B4', group: 'B', exclusive: true, title: 'Escolha de revista e submissão assistida', description: 'Indicação de periódicos por escopo e Qualis, checklist de submissão e acompanhamento no sistema da revista.' },
  { id: 'C1', group: 'C', exclusive: true, title: 'Slides de defesa e qualificação', description: 'Apresentação limpa e objetiva a partir do seu texto, com roteiro de tempo e figuras redesenhadas para projeção.' },
  { id: 'C2', group: 'C', exclusive: true, title: 'Pôster e banner de congresso', description: 'No tamanho e no modelo exigidos pelo evento, pronto para gráfica ou para o e-pôster.' },
  { id: 'C3', group: 'C', exclusive: true, title: 'Figuras técnicas vetoriais', description: 'Gráficos, fluxogramas, esquemas de ensaio e desenhos de engenharia refeitos em vetor, no padrão da revista.' },
  { id: 'C4', group: 'C', title: 'Resumo gráfico', description: 'O graphical abstract que muitas revistas exigem — e que também vira post para divulgar seu artigo.' },
];

export const serviceTitle = (id: string) => SERVICES.find((s) => s.id === id)?.title ?? id;

export const NORMS = ['ABNT', 'APA 7', 'Vancouver', 'IEEE', 'Norma da revista', 'Manual da instituição', 'Não sei / preciso de ajuda'];

export const DOC_TYPES = ['TCC', 'Dissertação', 'Tese', 'Artigo', 'Projeto de pesquisa', 'Relatório', 'Livro / capítulo', 'Outro'];

export const PLANS = [
  { id: 'essencial', name: 'Essencial' },
  { id: 'completo', name: 'Completo' },
  { id: 'sob-medida', name: 'Sob medida' },
];

export type OrderStatus =
  | 'recebido'
  | 'orcamento_enviado'
  | 'aprovado'
  | 'em_andamento'
  | 'entregue'
  | 'cancelado';

export const STATUS: { id: OrderStatus; label: string }[] = [
  { id: 'recebido', label: 'Recebido' },
  { id: 'orcamento_enviado', label: 'Orçamento enviado' },
  { id: 'aprovado', label: 'Aprovado' },
  { id: 'em_andamento', label: 'Em andamento' },
  { id: 'entregue', label: 'Entregue' },
  { id: 'cancelado', label: 'Cancelado' },
];

export const statusLabel = (s: OrderStatus) => STATUS.find((x) => x.id === s)?.label ?? s;

export type ServiceGroup = 'A' | 'B' | 'C';

export interface Service {
  id: string;
  group: ServiceGroup;
  title: string;
  description: string;
  exclusive?: boolean;
  /** Preço exibido no site (referência; o orçamento final é fechado por pedido). */
  price: string;
  /** Prazo padrão de entrega. */
  deadline: string;
}

export const GROUPS: Record<ServiceGroup, string> = {
  A: 'Formatação e normalização',
  B: 'Idioma e publicação',
  C: 'Apresentação e divulgação',
};

export const SERVICES: Service[] = [
  { id: 'A1', group: 'A', exclusive: true, title: 'TCC, dissertação e tese na ABNT', description: 'NBR 14724 completa: capa, folha de rosto, sumário e listas automáticos, numeração, títulos, citações e o manual da sua instituição.', price: 'Essencial R$ 9 · Completo R$ 14 por lauda', deadline: '3 a 7 dias úteis' },
  { id: 'A2', group: 'A', title: 'Artigo nas normas da revista', description: 'Adequação ao guia para autores e ao template do periódico — Elsevier, Springer, MDPI, SciELO, IEEE e outros.', price: 'R$ 320 por artigo', deadline: '2 dias úteis' },
  { id: 'A3', group: 'A', exclusive: true, title: 'Referências e citações', description: 'NBR 6023 e 10520, APA, Vancouver. Conferência citação × lista e organização da sua base no Zotero ou Mendeley.', price: 'R$ 2,50 por referência', deadline: '2 dias úteis' },
  { id: 'A4', group: 'A', title: 'Tabelas, quadros e figuras', description: 'Padronização de legendas, fontes, numeração e resolução, tabelas no padrão IBGE e figuras prontas para impressão.', price: 'R$ 60 por tabela ou figura', deadline: '2 dias úteis' },
  { id: 'A5', group: 'A', exclusive: true, title: 'Templates Word e LaTeX', description: 'Modelo com estilos prontos, ou projeto Overleaf com abnTeX2 — para você continuar escrevendo já formatado.', price: 'Word R$ 450 · LaTeX R$ 900', deadline: '3 a 5 dias úteis' },
  { id: 'B1', group: 'B', title: 'Tradução acadêmica PT → EN', description: 'Tradução técnica com a terminologia da sua área, seguida de revisão do inglês. Envie seu glossário e a lista de referências.', price: 'R$ 0,38 por palavra (≈ R$ 65/lauda)', deadline: '~2.000 palavras/dia útil' },
  { id: 'B2', group: 'B', title: 'Revisão de texto', description: 'Português ou inglês: gramática, coesão e clareza, sempre com controle de alterações para você aprovar cada mudança.', price: 'PT R$ 18/lauda · EN R$ 0,22/palavra', deadline: '3 a 5 dias úteis' },
  { id: 'B3', group: 'B', exclusive: true, title: 'Cover letter e resposta aos revisores', description: 'Carta ao editor na submissão e, depois, a carta ponto a ponto respondendo aos pareceristas na revisão.', price: 'Cover letter R$ 280 · resposta a partir de R$ 650', deadline: '2 a 4 dias úteis' },
  { id: 'B4', group: 'B', exclusive: true, title: 'Escolha de revista e submissão assistida', description: 'Indicação de periódicos por escopo e Qualis, checklist de submissão e acompanhamento no sistema da revista.', price: 'R$ 690 (escolha + submissão)', deadline: '3 dias úteis' },
  { id: 'C1', group: 'C', exclusive: true, title: 'Slides de defesa e qualificação', description: 'Apresentação limpa e objetiva a partir do seu texto, com roteiro de tempo e figuras redesenhadas para projeção.', price: 'R$ 45 por slide · defesa a partir de R$ 1.200', deadline: '3 a 5 dias úteis' },
  { id: 'C2', group: 'C', exclusive: true, title: 'Pôster e banner de congresso', description: 'No tamanho e no modelo exigidos pelo evento, pronto para gráfica ou para o e-pôster.', price: 'R$ 650 por pôster', deadline: '3 dias úteis' },
  { id: 'C3', group: 'C', exclusive: true, title: 'Figuras técnicas vetoriais', description: 'Gráficos, fluxogramas, esquemas de ensaio e desenhos de engenharia refeitos em vetor, no padrão da revista.', price: 'R$ 120 a R$ 280 por figura', deadline: '1 a 3 dias úteis' },
  { id: 'C4', group: 'C', title: 'Resumo gráfico', description: 'O graphical abstract que muitas revistas exigem — e que também vira post para divulgar seu artigo.', price: 'R$ 790', deadline: '4 dias úteis' },
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

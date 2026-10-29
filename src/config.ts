// Dados do negócio — edite aqui; o site inteiro usa estes valores.
export const BUSINESS = {
  name: 'formatation',
  instagram: 'https://www.instagram.com/formatation/',
  // Somente dígitos, com DDI e DDD.
  whatsapp: '5511974807564',
  whatsappDisplay: '(11) 97480-7564',
  email: '[SEU-EMAIL]',
  legal: '[CNPJ/MEI]',
  // Prazos
  quoteHours: '4',
  revisionWindow: '30 dias',
  avgDays: '5',
  payment: '[Pix, cartão ou boleto — 50% na aprovação e 50% na entrega.]',
};

// Formatação e revisão cobradas por lauda; tradução por palavra do texto original.
export const PRICING = {
  // Lauda = 2.100 caracteres com espaços (≈ 1 página ABNT, fonte 12, espaço 1,5).
  unit: 'lauda',
  unitDefinition: '2.100 caracteres com espaços (≈ 1 página ABNT)',
  essencial: '9',
  completo: '14',
  minimum: 'R$ 150',
  urgency48: '+50%',
  urgency24: '+100%',
};

// Prazos padrão de formatação por tipo de documento.
export const DEADLINES = [
  { doc: 'Artigo ou TCC até 60 páginas', days: '3 dias úteis' },
  { doc: 'Dissertação (até 150 páginas)', days: '5 dias úteis' },
  { doc: 'Tese (até 300 páginas)', days: '7 dias úteis' },
];

export const whatsappLink = (message: string) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

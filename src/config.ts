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

// Formatação cobrada por página (documento inteiro, com pré e pós-textuais).
export const PRICING = {
  essencial: '4,00',
  completo: '6,00',
  minimum: 'R$ 80',
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

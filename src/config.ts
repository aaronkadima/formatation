// Dados do negócio — edite aqui; o site inteiro usa estes valores.
export const BUSINESS = {
  name: 'formatation',
  instagram: 'https://www.instagram.com/formatation/',
  // Somente dígitos, com DDI e DDD. Ex.: 5591999999999
  whatsapp: '[SEU-NUMERO]',
  email: '[SEU-EMAIL]',
  legal: '[CNPJ/MEI]',
  quoteHours: '[X]',
  revisionWindow: '[PRAZO]',
  avgDays: '[X]',
  payment: '[Pix, cartão ou boleto — 50% na aprovação e 50% na entrega.]',
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

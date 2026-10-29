# formatation

Plataforma da **formatation**: site institucional, pedido de orçamento com upload de arquivos, área do cliente (aprovar orçamento, baixar entrega) e painel administrativo.

React + Vite + TypeScript no front; Supabase (Postgres, Auth e Storage) no backend. Pagamento é combinado fora do site (Pix/cartão pelo WhatsApp).

## Como trabalhamos (branches)

- **`dev`**: desenvolvimento. Toda mudança nova entra aqui primeiro.
- **`main`**: versão pronta. Só recebe o que já foi conferido no `dev`, via *pull request* `dev → main`.

A cada envio para `dev` ou `main`, e em todo pull request para `main`, o GitHub roda a **Verificação** (aba *Actions*):

1. **Site compila**: instala as dependências e gera a versão de produção.
2. **Regras de acesso do banco**: sobe um Postgres 16 limpo, aplica `supabase/schema.sql` duas vezes (para garantir que pode ser reaplicado) e roda os 32 testes de `tests/rls_test.py`.

Se algum passo falhar, o commit aparece com ✗ vermelho e não deve ir para o `main`.

## Rodar localmente

```bash
npm install
npm run dev
```

Sem configurar nada, o site roda em **modo demonstração**: a landing funciona e o formulário de pedido envia os dados pelo WhatsApp.

## Ativar pedidos, área do cliente e painel

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e rode `supabase/schema.sql` inteiro. Ele cria as tabelas, as regras de acesso e o bucket privado `pedidos`. O arquivo pode ser rodado de novo sem perder dados.
3. Em **Authentication → URL Configuration**, defina o *Site URL* com o endereço do site (ex.: `https://formatation.com.br`) e adicione `http://localhost:5173/**` em *Redirect URLs*.
4. Copie `.env.example` para `.env.local` e preencha com *Project URL* e *anon public key* (Project Settings → API).
5. Entre no site uma vez com o seu e-mail e depois, no SQL Editor, torne-se administrador:
   ```sql
   update public.profiles set role = 'admin' where email = 'seu@email.com';
   ```
   O link **Painel** aparece no menu.

## Editar textos e dados do negócio

- `src/config.ts` — WhatsApp, e-mail, CNPJ/MEI, prazos e forma de pagamento.
- `src/lib/catalog.ts` — lista de serviços, normas, tipos de documento e planos.
- `src/pages/Home.tsx` — preços (`[PREÇO]`), depoimentos e FAQ.

Tudo que está entre colchetes, como `[PREÇO]` ou `[X]`, é um campo a preencher.

## Publicar (Vercel)

1. Importe o repositório em [vercel.com](https://vercel.com). O framework Vite é detectado sozinho.
2. Em *Environment Variables*, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Faça o deploy. O `vercel.json` já cuida das rotas (`/conta`, `/admin` etc.).

## Como funciona

| Etapa | Cliente | Você (painel) |
|---|---|---|
| Pedido | Confirma o e-mail (link mágico, sem senha), preenche o formulário e anexa os arquivos | Vê o pedido em "Aguardando orçamento" |
| Orçamento | — | Define valor, prazo e mensagem; avisa pelo WhatsApp com um clique |
| Aprovação | Aprova ou recusa na área do cliente | Status muda sozinho para "Aprovado" |
| Produção | Acompanha o histórico e pode enviar novos arquivos | Muda o status, publica atualizações, guarda notas internas |
| Entrega | Baixa os arquivos finais | Publica a entrega e marca como entregue |

## Segurança

As regras ficam no próprio banco (Row Level Security) e foram testadas num Postgres 16 local (32 de 32 cenários):

- o cliente só vê os próprios pedidos e arquivos;
- o cliente não define preço nem status: a aprovação passa pela função `respond_quote`;
- o cliente não consegue se tornar admin;
- só o admin publica arquivos de entrega;
- as notas internas ficam em uma tabela à parte, invisível ao cliente;
- o bucket é privado e os downloads usam links temporários de 10 minutos.

## Próximos passos sugeridos

- E-mail automático a cada mudança de status (Supabase Edge Function + Resend).
- Página de amostras para download.
- Domínio próprio.

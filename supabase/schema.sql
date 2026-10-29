-- formatation — schema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma única vez.
-- Depois, para virar administrador, rode no final (com o seu e-mail):
--   update public.profiles set role = 'admin' where email = 'voce@exemplo.com';

-- ───────────────────────── Perfis ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  institution text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Cria o perfil automaticamente quando alguém entra pela primeira vez.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que um cliente se promova a admin.
create or replace function public.protect_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- auth.uid() nulo = SQL Editor / service role (confiáveis); bloqueia só usuários logados não-admin.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Somente administradores podem alterar papéis.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles enable row level security;

drop policy if exists "perfil: ler o próprio ou admin" on public.profiles;
create policy "perfil: ler o próprio ou admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "perfil: editar o próprio ou admin" on public.profiles;
create policy "perfil: editar o próprio ou admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- ───────────────────────── Pedidos ─────────────────────────
create sequence if not exists public.order_code_seq start 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('FMT-' || lpad(nextval('public.order_code_seq')::text, 4, '0')),
  client_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  services text[] not null default '{}',
  plan text,
  document_type text,
  norm text,
  pages integer check (pages is null or pages > 0),
  desired_deadline date,
  notes text,
  status text not null default 'recebido'
    check (status in ('recebido', 'orcamento_enviado', 'aprovado', 'em_andamento', 'entregue', 'cancelado')),
  quote_amount numeric(10, 2),
  quote_deadline date,
  quote_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_client_idx on public.orders (client_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

-- Notas internas: tabela separada, invisível ao cliente.
create table if not exists public.order_private (
  order_id uuid primary key references public.orders (id) on delete cascade,
  admin_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind text not null check (kind in ('original', 'norma', 'entrega')),
  path text not null unique,
  name text not null,
  size bigint not null default 0,
  uploaded_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists order_files_order_idx on public.order_files (order_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text,
  message text not null,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- Dono do pedido (usado nas políticas de arquivos e do storage).
create or replace function public.owns_order(p_order uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.orders where id = p_order and client_id = auth.uid());
$$;

-- Linha do tempo automática + updated_at.
create or replace function public.order_audit()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, status, message)
    values (new.id, new.status, 'Pedido recebido');
    return new;
  end if;
  new.updated_at := now();
  if new.status is distinct from old.status then
    insert into public.order_events (order_id, status, message)
    values (new.id, new.status, case new.status
      when 'orcamento_enviado' then 'Orçamento enviado'
      when 'aprovado' then 'Orçamento aprovado pelo cliente'
      when 'em_andamento' then 'Formatação em andamento'
      when 'entregue' then 'Trabalho entregue'
      when 'cancelado' then 'Pedido cancelado'
      else 'Status atualizado' end);
  end if;
  return new;
end;
$$;

drop trigger if exists orders_audit_ins on public.orders;
create trigger orders_audit_ins after insert on public.orders
  for each row execute function public.order_audit();
drop trigger if exists orders_audit_upd on public.orders;
create trigger orders_audit_upd before update on public.orders
  for each row execute function public.order_audit();

-- Cliente aprova ou recusa o orçamento (única alteração permitida a ele).
create or replace function public.respond_quote(p_order uuid, p_accept boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.orders
     set status = case when p_accept then 'aprovado' else 'cancelado' end
   where id = p_order
     and client_id = auth.uid()
     and status = 'orcamento_enviado';
  if not found then
    raise exception 'Não há orçamento pendente para este pedido.';
  end if;
end;
$$;

alter table public.orders enable row level security;
alter table public.order_files enable row level security;
alter table public.order_private enable row level security;

drop policy if exists "notas internas: só admin" on public.order_private;
create policy "notas internas: só admin" on public.order_private
  for all using (public.is_admin()) with check (public.is_admin());
alter table public.order_events enable row level security;

drop policy if exists "pedido: ler" on public.orders;
create policy "pedido: ler" on public.orders
  for select using (client_id = auth.uid() or public.is_admin());

drop policy if exists "pedido: criar" on public.orders;
create policy "pedido: criar" on public.orders
  for insert with check (
    client_id = auth.uid()
    and status = 'recebido'
    and quote_amount is null and quote_deadline is null and quote_message is null
  );

drop policy if exists "pedido: admin altera" on public.orders;
create policy "pedido: admin altera" on public.orders
  for update using (public.is_admin());

drop policy if exists "pedido: admin exclui" on public.orders;
create policy "pedido: admin exclui" on public.orders
  for delete using (public.is_admin());

drop policy if exists "arquivo: ler" on public.order_files;
create policy "arquivo: ler" on public.order_files
  for select using (public.owns_order(order_id) or public.is_admin());

drop policy if exists "arquivo: cliente envia" on public.order_files;
create policy "arquivo: cliente envia" on public.order_files
  for insert with check (
    public.is_admin()
    or (public.owns_order(order_id) and kind in ('original', 'norma'))
  );

drop policy if exists "arquivo: admin exclui" on public.order_files;
create policy "arquivo: admin exclui" on public.order_files
  for delete using (public.is_admin());

drop policy if exists "evento: ler" on public.order_events;
create policy "evento: ler" on public.order_events
  for select using (public.owns_order(order_id) or public.is_admin());

drop policy if exists "evento: admin cria" on public.order_events;
create policy "evento: admin cria" on public.order_events
  for insert with check (public.is_admin());

-- ───────────────────────── Storage ─────────────────────────
-- Bucket privado; caminho dos arquivos: <order_id>/<kind>/<arquivo>
insert into storage.buckets (id, name, public, file_size_limit)
values ('pedidos', 'pedidos', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "storage pedidos: ler" on storage.objects;
create policy "storage pedidos: ler" on storage.objects
  for select using (
    bucket_id = 'pedidos'
    and (public.is_admin() or public.owns_order(((storage.foldername(name))[1])::uuid))
  );

drop policy if exists "storage pedidos: enviar" on storage.objects;
create policy "storage pedidos: enviar" on storage.objects
  for insert with check (
    bucket_id = 'pedidos'
    and (
      public.is_admin()
      or (
        public.owns_order(((storage.foldername(name))[1])::uuid)
        and (storage.foldername(name))[2] in ('original', 'norma')
      )
    )
  );

drop policy if exists "storage pedidos: admin exclui" on storage.objects;
create policy "storage pedidos: admin exclui" on storage.objects
  for delete using (bucket_id = 'pedidos' and public.is_admin());

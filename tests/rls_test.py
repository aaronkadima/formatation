import subprocess, sys
D='/var/lib/postgresql/fmt-test'
A='aaaaaaaa-0000-0000-0000-00000000000a'
B='bbbbbbbb-0000-0000-0000-00000000000b'
ADM='cccccccc-0000-0000-0000-00000000000c'

def sql(q, user=None, role='authenticated'):
    pre = ''
    if user or role == 'anon':
        pre = f"set role {role}; select set_config('request.jwt.claim.sub', '{user or ''}', false); "
    r = subprocess.run(['psql','-h',D,'-p','5499','-U','postgres','-tAq','-v','ON_ERROR_STOP=1','-c',pre+q],capture_output=True,text=True)
    return r.returncode, (r.stdout.strip().splitlines() or [''])[-1], r.stderr.strip()

results=[]
def check(name, cond, detail=''):
    results.append(cond); print(('PASS' if cond else 'FAIL'), name, '' if cond else detail)

# setup users
sql(f"insert into auth.users(id,email) values ('{A}','a@x.com'),('{B}','b@x.com'),('{ADM}','adm@x.com')")
c,o,e=sql("select count(*) from public.profiles"); check('trigger cria perfis no cadastro', o=='3', o+e)
sql(f"update public.profiles set role='admin' where id='{ADM}'")

# client A creates order
c,o,e=sql("insert into public.orders(services,plan,norm) values ('{A1}','completo','ABNT') returning id", A)
check('cliente cria pedido', c==0, e); OID=o
c,o,e=sql(f"select code from public.orders where id='{OID}'", A); check('código FMT gerado', o.startswith('FMT-'), o)
c,o,e=sql(f"select count(*) from public.order_events where order_id='{OID}'", A); check('evento "Pedido recebido" visível ao cliente', o=='1', o+e)

c,o,e=sql("insert into public.orders(services,quote_amount) values ('{A1}',1)", A); check('cliente NÃO cria pedido com preço próprio', c!=0, o)
c,o,e=sql(f"insert into public.orders(services,client_id) values ('{{A1}}','{B}')", A); check('cliente NÃO cria pedido em nome de outro', c!=0, o)
c,o,e=sql("insert into public.orders(services,status) values ('{A1}','entregue')", A); check('cliente NÃO cria pedido já entregue', c!=0, o)

c,o,e=sql(f"select count(*) from public.orders where id='{OID}'", B); check('outro cliente NÃO vê o pedido', o=='0', o)
c,o,e=sql(f"select count(*) from public.orders", role='anon'); check('anônimo NÃO vê pedidos', o=='0' or c!=0, o+e)
c,o,e=sql(f"with u as (update public.orders set status='entregue', quote_amount=1 where id='{OID}' returning 1) select count(*) from u", A)
check('cliente NÃO altera status/preço direto', o=='0', o+e)
c,o,e=sql(f"update public.profiles set role='admin' where id='{A}'", A); check('cliente NÃO vira admin', c!=0, o)
c,o,e=sql(f"update public.profiles set full_name='Ana' where id='{A}'", A); check('cliente edita o próprio nome', c==0, e)
c,o,e=sql(f"with u as (update public.profiles set full_name='hack' where id='{B}' returning 1) select count(*) from u", A); check('cliente NÃO edita perfil alheio', o=='0', o+e)

# admin
c,o,e=sql(f"insert into public.order_private(order_id,admin_notes) values ('{OID}','segredo')", ADM); check('admin grava nota interna', c==0, e)
c,o,e=sql(f"select count(*) from public.order_private", A); check('cliente NÃO lê notas internas', o=='0', o+e)
c,o,e=sql(f"select count(*) from public.orders", ADM); check('admin vê todos os pedidos', o=='1', o+e)
c,o,e=sql(f"update public.orders set quote_amount=450, quote_deadline='2026-12-01', status='orcamento_enviado' where id='{OID}'", ADM); check('admin envia orçamento', c==0, e)
c,o,e=sql(f"select message from public.order_events where order_id='{OID}' order by created_at desc limit 1", A); check('histórico registra orçamento', o=='Orçamento enviado', o)

c,o,e=sql(f"select public.respond_quote('{OID}', true)", B); check('outro cliente NÃO aprova orçamento alheio', c!=0, o)
c,o,e=sql(f"select public.respond_quote('{OID}', true)", A); check('cliente aprova o próprio orçamento', c==0, e)
c,o,e=sql(f"select status from public.orders where id='{OID}'", A); check('status vira aprovado', o=='aprovado', o)
c,o,e=sql(f"select public.respond_quote('{OID}', false)", A); check('NÃO aprova/recusa duas vezes', c!=0, o)

# files table
c,o,e=sql(f"insert into public.order_files(order_id,kind,path,name) values ('{OID}','original','{OID}/original/t.docx','t.docx')", A); check('cliente registra arquivo original', c==0, e)
c,o,e=sql(f"insert into public.order_files(order_id,kind,path,name) values ('{OID}','entrega','{OID}/entrega/f.pdf','f.pdf')", A); check('cliente NÃO publica entrega', c!=0, o)
c,o,e=sql(f"insert into public.order_files(order_id,kind,path,name) values ('{OID}','original','{OID}/original/b.docx','b.docx')", B); check('outro cliente NÃO anexa no pedido alheio', c!=0, o)

# storage
c,o,e=sql(f"insert into storage.objects(bucket_id,name) values ('pedidos','{OID}/original/t.docx')", A); check('storage: cliente envia original', c==0, e)
c,o,e=sql(f"insert into storage.objects(bucket_id,name) values ('pedidos','{OID}/entrega/x.pdf')", A); check('storage: cliente NÃO envia em entrega', c!=0, o)
c,o,e=sql(f"insert into storage.objects(bucket_id,name) values ('pedidos','{OID}/original/y.docx')", B); check('storage: outro cliente NÃO envia no pedido alheio', c!=0, o)
c,o,e=sql(f"insert into storage.objects(bucket_id,name) values ('pedidos','{OID}/entrega/final.pdf')", ADM); check('storage: admin publica entrega', c==0, e)
c,o,e=sql(f"select count(*) from storage.objects where bucket_id='pedidos'", A); check('storage: cliente baixa os próprios arquivos', o=='2', o+e)
c,o,e=sql(f"select count(*) from storage.objects where bucket_id='pedidos'", B); check('storage: outro cliente NÃO vê arquivos', o=='0', o+e)
c,o,e=sql("select public from storage.buckets where id='pedidos'"); check('bucket é privado', o=='f', o)

print(f"\n{sum(results)}/{len(results)} testes passaram")
sys.exit(0 if all(results) else 1)

import { useCallback, useEffect, useState } from 'react';
import { requireDb, type Order, type OrderEvent, type OrderFile } from './supabase';

export interface OrderBundle {
  order: Order;
  files: OrderFile[];
  events: OrderEvent[];
}

export const ORDER_SELECT = '*, profiles(full_name, phone, email, institution)';

export function useOrder(id: string | undefined) {
  const [data, setData] = useState<OrderBundle | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const db = requireDb();
    const [o, f, e] = await Promise.all([
      db.from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle(),
      db.from('order_files').select('*').eq('order_id', id).order('created_at'),
      db.from('order_events').select('*').eq('order_id', id).order('created_at'),
    ]);
    if (o.error || f.error || e.error) {
      setError((o.error ?? f.error ?? e.error)!.message);
    } else if (!o.data) {
      setError('Pedido não encontrado.');
    } else {
      setData({ order: o.data as Order, files: (f.data ?? []) as OrderFile[], events: (e.data ?? []) as OrderEvent[] });
      setError('');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
}

export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : 'Erro inesperado.';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { OrderStatus } from './catalog';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** null = modo demonstração (sem backend configurado). */
export const supabase: SupabaseClient | null =
  url && key && !url.includes('SEU-PROJETO') ? createClient(url, key) : null;

export const BUCKET = 'pedidos';

export type FileKind = 'original' | 'norma' | 'entrega';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  institution: string | null;
  role: 'client' | 'admin';
  email: string | null;
}

export interface Order {
  id: string;
  code: string;
  client_id: string;
  services: string[];
  plan: string | null;
  document_type: string | null;
  norm: string | null;
  pages: number | null;
  desired_deadline: string | null;
  notes: string | null;
  status: OrderStatus;
  quote_amount: number | null;
  quote_deadline: string | null;
  quote_message: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, 'full_name' | 'phone' | 'email' | 'institution'> | null;
}

export interface OrderFile {
  id: string;
  order_id: string;
  kind: FileKind;
  path: string;
  name: string;
  size: number;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus | null;
  message: string;
  created_at: string;
}

export function requireDb(): SupabaseClient {
  if (!supabase) throw new Error('Supabase não configurado.');
  return supabase;
}

const safeName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(-120);

export async function uploadOrderFiles(orderId: string, kind: FileKind, files: File[]) {
  const db = requireDb();
  for (const file of files) {
    const path = `${orderId}/${kind}/${Date.now()}_${safeName(file.name)}`;
    const up = await db.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (up.error) throw up.error;
    const ins = await db.from('order_files').insert({
      order_id: orderId,
      kind,
      path,
      name: file.name,
      size: file.size,
    });
    if (ins.error) throw ins.error;
  }
}

export async function downloadUrl(path: string) {
  const { data, error } = await requireDb().storage.from(BUCKET).createSignedUrl(path, 60 * 10, { download: true });
  if (error) throw error;
  return data.signedUrl;
}

export const MAX_FILE_MB = 50;

export const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('pt-BR') : '—';

export const formatMoney = (v: number | null) =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BUSINESS } from '../config';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="formatation — início">
      <span className="brand-mark" aria-hidden="true">¶</span>
      <span className="brand-name">formatation</span>
    </Link>
  );
}

export default function Layout() {
  const { session, isAdmin, signOut } = useAuth();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <>
      <a href="#conteudo" className="sr-only">Pular para o conteúdo</a>
      {!supabase && (
        <div className="demo-banner">Modo demonstração — pedidos são enviados pelo WhatsApp até o backend ser configurado.</div>
      )}
      <header className="site-header">
        <nav className="container" aria-label="Principal">
          <Brand />
          <div className="nav-links">
            <Link to="/#servicos">Serviços</Link>
            <Link to="/#planos">Planos</Link>
            <Link to="/#processo">Como funciona</Link>
            <Link to="/#faq">Dúvidas</Link>
            {supabase && session && <NavLink to="/conta">Meus pedidos</NavLink>}
            {supabase && isAdmin && <NavLink to="/admin">Painel</NavLink>}
            {supabase && !session && <NavLink to="/entrar">Entrar</NavLink>}
            {supabase && session && (
              <button type="button" className="link-btn" style={{ color: 'var(--ink)', textDecoration: 'none' }} onClick={signOut}>Sair</button>
            )}
            <Link to="/pedido" className="btn btn-dark btn-sm">Pedir orçamento</Link>
          </div>
        </nav>
      </header>
      <div id="conteudo">
        <Outlet />
      </div>
      <footer className="site-footer">
        <div className="container inner">
          <span className="brand-name" style={{ color: 'var(--paper)', fontSize: 20 }}>formatation</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <a href={BUSINESS.instagram} target="_blank" rel="noreferrer">Instagram @formatation</a>
            <Link to="/#servicos">Serviços</Link>
            <Link to="/#faq">Dúvidas</Link>
            {supabase && <Link to="/conta">Área do cliente</Link>}
          </div>
          <span>© {new Date().getFullYear()} formatation · {BUSINESS.legal}</span>
        </div>
      </footer>
    </>
  );
}

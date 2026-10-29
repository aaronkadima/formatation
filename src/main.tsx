import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';

import './styles.css';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';
import { RequireAuth } from './components/ui';
import Home from './pages/Home';
import Pedido from './pages/Pedido';
import Entrar from './pages/Entrar';
import Conta from './pages/Conta';
import PedidoCliente from './pages/PedidoCliente';
import Admin from './pages/Admin';
import AdminPedido from './pages/AdminPedido';
import NotFound from './pages/NotFound';

// Prévia publicada como artifact: rotas em memória (o endereço da prévia não muda).
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="pedido" element={<Pedido />} />
            <Route path="entrar" element={<Entrar />} />
            <Route path="conta" element={<RequireAuth><Conta /></RequireAuth>} />
            <Route path="conta/pedidos/:id" element={<RequireAuth><PedidoCliente /></RequireAuth>} />
            <Route path="admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
            <Route path="admin/pedidos/:id" element={<RequireAuth admin><AdminPedido /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
);

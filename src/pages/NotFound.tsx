import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container app-page">
      <p className="kicker">Erro 404</p>
      <h1 className="h-display h2">Esta página saiu da margem.</h1>
      <p className="lead">O endereço não existe ou mudou de lugar.</p>
      <Link to="/" className="btn btn-dark" style={{ marginTop: 24 }}>Voltar ao início</Link>
    </main>
  );
}

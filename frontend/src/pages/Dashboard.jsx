import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';

const LOW_STOCK = 2; // fewer than 2 copies is "low"

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getBooks().then(setBooks).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const low = books.filter((b) => b.quantity < LOW_STOCK);
  const total = books.reduce((s, b) => s + b.quantity, 0);

  return (
    <>
      <h1>Dashboard</h1>
      <Alert onClose={() => setError('')}>{error}</Alert>
      {loading ? <p className="muted">Loading…</p> : (
        <>
          <div className="stats">
            <div className="card stat"><span>{books.length}</span>Titles</div>
            <div className="card stat"><span>{total}</span>Copies in stock</div>
            <div className={`card stat ${low.length ? 'stat-warn' : ''}`}><span>{low.length}</span>Low stock</div>
          </div>
          <h2>Book Availability</h2>
          {!books.length ? <p className="muted">No books yet.</p> : (
            <div className="cards">
              {books.map((b) => (
                <div key={b.id} className={`card book-card ${b.quantity < LOW_STOCK ? 'low' : ''}`}>
                  <h3>{b.title}</h3>
                  <p className="muted">{b.author} · {b.genre}</p>
                  <p className="isbn">ISBN {b.isbn}</p>
                  <div className="qty-row">
                    <strong>{b.quantity} in stock</strong>
                    {b.quantity === 0 ? <span className="badge badge-danger">Out of stock</span>
                      : b.quantity < LOW_STOCK ? <span className="badge badge-warn">Low stock</span>
                      : <span className="badge badge-ok">Available</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

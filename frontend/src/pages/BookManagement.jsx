import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import AddBookForm from '../components/AddBookForm.jsx';
import BookList from '../components/BookList.jsx';

export default function BookManagement() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const load = () => api.getBooks().then(setBooks).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  // each handler returns true on success so forms know whether to reset
  const run = async (fn, msg) => {
    setError(''); setSuccess('');
    try { await fn(); setSuccess(msg); await load(); return true; }
    catch (e) { setError(e.message); return false; }
  };

  const filtered = books.filter((b) =>
    `${b.title} ${b.author} ${b.genre} ${b.isbn}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <h1>Book Management</h1>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      {isAdmin && <AddBookForm onAdd={(b) => run(() => api.addBook(b), 'Book added')} />}
      <div className="card">
        <div className="toolbar">
          <h2>Books ({filtered.length})</h2>
          <input className="search" placeholder="Search books…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <BookList books={filtered} canEdit={isAdmin}
          onUpdate={(id, b) => run(() => api.updateBook(id, b), 'Book updated')}
          onDelete={(id) => run(() => api.deleteBook(id), 'Book deleted')} />
      </div>
    </>
  );
}

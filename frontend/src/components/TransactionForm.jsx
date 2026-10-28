import { useState } from 'react';

// Add stock (admin) or borrow a book (deduct stock)
export default function TransactionForm({ books, users, currentUser, onSubmit }) {
  const isAdmin = currentUser.role === 'admin';
  const [form, setForm] = useState({
    book_id: '', type: isAdmin ? 'ADD_STOCK' : 'BORROW',
    user_id: isAdmin ? '' : String(currentUser.id), quantity: 1,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.book_id) return setError('Please select a book');
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) return setError('Quantity must be at least 1');
    if (form.type === 'BORROW' && !form.user_id) return setError('Please select the borrower');
    const book = books.find((b) => String(b.id) === form.book_id);
    if (form.type === 'BORROW' && book && book.quantity < Number(form.quantity))
      return setError(`Only ${book.quantity} cop${book.quantity === 1 ? 'y' : 'ies'} of "${book.title}" in stock`);
    setError('');
    setBusy(true);
    const ok = await onSubmit({
      book_id: Number(form.book_id), type: form.type,
      user_id: form.user_id ? Number(form.user_id) : null, quantity: Number(form.quantity),
    });
    setBusy(false);
    if (ok) setForm({ ...form, book_id: '', quantity: 1 });
  };

  return (
    <form className="card form-grid" onSubmit={submit} noValidate>
      <h2>Record Transaction</h2>
      <div className="field">
        <label htmlFor="tx-type">Action</label>
        <select id="tx-type" name="type" value={form.type} onChange={change}>
          {isAdmin && <option value="ADD_STOCK">Add stock (new books arrived)</option>}
          <option value="BORROW">Borrow (deduct stock)</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="tx-book">Book</label>
        <select id="tx-book" name="book_id" value={form.book_id} onChange={change}>
          <option value="">— Select a book —</option>
          {books.map((b) => <option key={b.id} value={b.id}>{b.title} (in stock: {b.quantity})</option>)}
        </select>
      </div>
      {form.type === 'BORROW' && (
        <div className="field">
          <label htmlFor="tx-user">Borrower</label>
          <select id="tx-user" name="user_id" value={form.user_id} onChange={change} disabled={!isAdmin}>
            <option value="">— Select a user —</option>
            {(isAdmin ? users : [currentUser]).map((u) => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
          </select>
        </div>
      )}
      <div className="field">
        <label htmlFor="tx-qty">Quantity</label>
        <input id="tx-qty" name="quantity" type="number" min="1" value={form.quantity} onChange={change} />
      </div>
      {error && <small className="error-text full">{error}</small>}
      <div className="field actions">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : form.type === 'ADD_STOCK' ? 'Add Stock' : 'Borrow Book'}</button>
      </div>
    </form>
  );
}

import { useState } from 'react';

// Editable list of books with Update and Delete buttons
export default function BookList({ books, onUpdate, onDelete, canEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [rowError, setRowError] = useState('');

  const startEdit = (b) => { setEditingId(b.id); setDraft({ ...b }); setRowError(''); };
  const cancel = () => { setEditingId(null); setRowError(''); };
  const change = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const save = async () => {
    if (!draft.title.trim() || !draft.author.trim() || !draft.genre.trim() || !String(draft.isbn).trim()) {
      return setRowError('All fields are required');
    }
    if (draft.quantity === '' || !Number.isInteger(Number(draft.quantity)) || Number(draft.quantity) < 0) {
      return setRowError('Quantity must be 0 or more');
    }
    const ok = await onUpdate(draft.id, { ...draft, quantity: Number(draft.quantity) });
    if (ok) cancel();
  };

  const remove = (b) => {
    if (window.confirm(`Delete "${b.title}"? Its transaction history will be removed too.`)) onDelete(b.id);
  };

  if (!books.length) return <p className="muted">No books found.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th>{canEdit && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {books.map((b) =>
            editingId === b.id ? (
              <tr key={b.id} className="editing">
                <td data-label="Title"><input name="title" value={draft.title} onChange={change} /></td>
                <td data-label="Author"><input name="author" value={draft.author} onChange={change} /></td>
                <td data-label="Genre"><input name="genre" value={draft.genre} onChange={change} /></td>
                <td data-label="ISBN"><input name="isbn" value={draft.isbn} onChange={change} /></td>
                <td data-label="Qty"><input name="quantity" type="number" min="0" value={draft.quantity} onChange={change} /></td>
                <td data-label="Actions" className="row-actions">
                  <button className="btn btn-small" onClick={save}>Save</button>
                  <button className="btn btn-small btn-light" onClick={cancel}>Cancel</button>
                  {rowError && <small className="error-text">{rowError}</small>}
                </td>
              </tr>
            ) : (
              <tr key={b.id}>
                <td data-label="Title">{b.title}</td>
                <td data-label="Author">{b.author}</td>
                <td data-label="Genre">{b.genre}</td>
                <td data-label="ISBN">{b.isbn}</td>
                <td data-label="Qty">{b.quantity}</td>
                {canEdit && (
                  <td data-label="Actions" className="row-actions">
                    <button className="btn btn-small" onClick={() => startEdit(b)}>Update</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(b)}>Delete</button>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from 'react';

const empty = { title: '', author: '', genre: '', isbn: '', quantity: '' };

// Controlled form used for adding a new book (AddBookForm)
export default function AddBookForm({ onAdd }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.genre.trim()) e.genre = 'Genre is required';
    if (!/^[0-9-]{10,17}$/.test(form.isbn.trim())) e.isbn = 'ISBN must be 10–17 digits (hyphens allowed)';
    if (form.quantity === '' || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0)
      e.quantity = 'Quantity must be 0 or more';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const ok = await onAdd({ ...form, quantity: Number(form.quantity) });
    setBusy(false);
    if (ok) setForm(empty);
  };

  const field = (name, label, type = 'text') => (
    <div className="field">
      <label htmlFor={`add-${name}`}>{label}</label>
      <input id={`add-${name}`} name={name} type={type} min={type === 'number' ? 0 : undefined}
        value={form[name]} onChange={change} className={errors[name] ? 'invalid' : ''} />
      {errors[name] && <small className="error-text">{errors[name]}</small>}
    </div>
  );

  return (
    <form className="card form-grid" onSubmit={submit} noValidate>
      <h2>Add New Book</h2>
      {field('title', 'Title')}
      {field('author', 'Author')}
      {field('genre', 'Genre')}
      {field('isbn', 'ISBN')}
      {field('quantity', 'Initial Quantity', 'number')}
      <div className="field actions">
        <button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Add Book'}</button>
      </div>
    </form>
  );
}

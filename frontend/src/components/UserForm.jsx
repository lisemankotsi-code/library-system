import { useState } from 'react';

const empty = { name: '', membership_id: '', role: 'member', password: '' };

// Used for both adding and updating a user
export default function UserForm({ editingUser, onSave, onCancel }) {
  const [form, setForm] = useState(editingUser ? { ...editingUser, password: '' } : empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const editing = Boolean(editingUser);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.membership_id.trim()) errs.membership_id = 'Membership ID is required';
    if (!editing && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (editing && form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const ok = await onSave(form);
    setBusy(false);
    if (ok && !editing) setForm(empty);
  };

  return (
    <form className="card form-grid" onSubmit={submit} noValidate>
      <h2>{editing ? 'Update User' : 'Add New User'}</h2>
      <div className="field">
        <label htmlFor="u-name">Name</label>
        <input id="u-name" name="name" value={form.name} onChange={change} className={errors.name ? 'invalid' : ''} />
        {errors.name && <small className="error-text">{errors.name}</small>}
      </div>
      <div className="field">
        <label htmlFor="u-mid">Membership ID</label>
        <input id="u-mid" name="membership_id" value={form.membership_id} onChange={change} className={errors.membership_id ? 'invalid' : ''} />
        {errors.membership_id && <small className="error-text">{errors.membership_id}</small>}
      </div>
      <div className="field">
        <label htmlFor="u-role">Role</label>
        <select id="u-role" name="role" value={form.role} onChange={change}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="u-pw">{editing ? 'New Password (optional)' : 'Password'}</label>
        <input id="u-pw" name="password" type="password" value={form.password} onChange={change} className={errors.password ? 'invalid' : ''} />
        {errors.password && <small className="error-text">{errors.password}</small>}
      </div>
      <div className="field actions">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Changes' : 'Add User'}</button>
        {editing && <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

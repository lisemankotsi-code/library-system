import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from './Alert.jsx';

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.membership_id.trim() || !form.password) return setError('Enter your membership ID and password');
    setBusy(true);
    try {
      login(await api.login(form));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card login-card" onSubmit={submit} noValidate>
      <h2>Login</h2>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <div className="field">
        <label htmlFor="login-id">Membership ID</label>
        <input id="login-id" name="membership_id" value={form.membership_id} onChange={change} autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="login-pw">Password</label>
        <input id="login-pw" name="password" type="password" value={form.password} onChange={change} autoComplete="current-password" />
      </div>
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
          </form>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import LoginForm from '../components/LoginForm.jsx';
import UserForm from '../components/UserForm.jsx';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isAdmin = user?.role === 'admin';

  const load = () => api.getUsers().then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!user) return <LoginForm />;

  if (!isAdmin) {
    return (
      <>
        <h1>My Account</h1>
        <div className="card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Membership ID:</strong> {user.membership_id}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p className="muted">Only admins can manage users.</p>
        </div>
      </>
    );
  }

  const run = async (fn, msg) => {
    setError(''); setSuccess('');
    try { await fn(); setSuccess(msg); await load(); return true; }
    catch (e) { setError(e.message); return false; }
  };

  const remove = (u) => {
    if (u.id === user.id) return setError('You cannot delete your own account while logged in');
    if (window.confirm(`Delete user "${u.name}"?`)) run(() => api.deleteUser(u.id), 'User deleted');
  };

  return (
    <>
      <h1>User Management</h1>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      {editing ? (
        <UserForm key={editing.id} editingUser={editing} onCancel={() => setEditing(null)}
          onSave={async (u) => {
            const ok = await run(() => api.updateUser(editing.id, u), 'User updated');
            if (ok) setEditing(null);
            return ok;
          }} />
      ) : (
        <UserForm key="new" onSave={(u) => run(() => api.addUser(u), 'User added')} />
      )}

      <div className="card">
        <h2>All Users ({users.length})</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{u.name}</td>
                  <td data-label="Membership ID">{u.membership_id}</td>
                  <td data-label="Role"><span className={`badge ${u.role === 'admin' ? 'badge-warn' : 'badge-ok'}`}>{u.role}</span></td>
                  <td data-label="Actions" className="row-actions">
                    <button className="btn btn-small" onClick={() => { setEditing(u); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Update</button>
                    <button className="btn btn-small btn-danger" onClick={() => remove(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

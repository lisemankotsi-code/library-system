import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';

export default function Transactions() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [b, t, u] = await Promise.all([
        api.getBooks(), api.getTransactions(),
        user.role === 'admin' ? api.getUsers() : Promise.resolve([]),
      ]);
      setBooks(b); setTransactions(t); setUsers(u);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (tx) => {
    setError(''); setSuccess('');
    try {
      await api.addTransaction(tx);
      setSuccess(tx.type === 'ADD_STOCK' ? 'Stock added' : 'Book borrowed');
      await load();
      return true;
    } catch (e) { setError(e.message); return false; }
  };

  // members only see their own borrowing history
  const visible = user.role === 'admin' ? transactions : transactions.filter((t) => t.user_id === user.id);

  return (
    <>
      <h1>Transactions</h1>
      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
      <TransactionForm books={books} users={users} currentUser={user} onSubmit={submit} />
      <div className="card">
        <h2>Transaction History</h2>
        <TransactionHistory transactions={visible} />
      </div>
    </>
  );
}

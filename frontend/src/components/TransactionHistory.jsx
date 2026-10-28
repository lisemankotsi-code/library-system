export default function TransactionHistory({ transactions }) {
  if (!transactions.length) return <p className="muted">No transactions yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Book</th><th>Type</th><th>Qty</th><th>User</th></tr></thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="Type">
                <span className={`badge ${t.type === 'ADD_STOCK' ? 'badge-ok' : 'badge-warn'}`}>
                  {t.type === 'ADD_STOCK' ? 'Stock added' : 'Borrowed'}
                </span>
              </td>
              <td data-label="Qty">{t.type === 'ADD_STOCK' ? '+' : '−'}{t.quantity}</td>
              <td data-label="User">{t.user_name ? `${t.user_name} (${t.membership_id})` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

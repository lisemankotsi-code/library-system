import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookManagement from './pages/BookManagement.jsx';
import Transactions from './pages/Transactions.jsx';
import UserManagement from './pages/UserManagement.jsx';
import { useAuth } from './AuthContext.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/users" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/books" element={<Protected><BookManagement /></Protected>} />
          <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

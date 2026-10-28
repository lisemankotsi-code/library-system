import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); setOpen(false); navigate('/users'); };
  const link = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand"> Library Inventory</span>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
        <nav className={open ? 'nav-links open' : 'nav-links'} onClick={() => setOpen(false)}>
          {user && (
            <>
              <NavLink to="/" end className={link}>Dashboard</NavLink>
              <NavLink to="/books" className={link}>Books</NavLink>
              <NavLink to="/transactions" className={link}>Transactions</NavLink>
            </>
          )}
          <NavLink to="/users" className={link}>{user ? 'Users' : 'Login'}</NavLink>
          {user && (
            <span className="nav-user">
              {user.name} <em>({user.role})</em>
              <button className="btn btn-small btn-light" onClick={handleLogout}>Logout</button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

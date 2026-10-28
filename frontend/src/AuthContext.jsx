import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = (u) => {
    setUser(u);
    try { localStorage.setItem('user', JSON.stringify(u)); } catch { /* ignore */ }
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem('user'); } catch { /* ignore */ }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pm_token'));
  const [masterPassword, setMasterPassword] = useState('');
  const [kdfSalt, setKdfSalt] = useState(() => localStorage.getItem('pm_salt'));

  const register = useCallback(async (email, password) => {
    const { data } = await axios.post('/api/auth/register', { email, master_password: password });
    localStorage.setItem('pm_token', data.access_token);
    localStorage.setItem('pm_salt', data.kdf_salt);
    setToken(data.access_token);
    setKdfSalt(data.kdf_salt);
    setMasterPassword(password);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, master_password: password });
    localStorage.setItem('pm_token', data.access_token);
    localStorage.setItem('pm_salt', data.kdf_salt);
    setToken(data.access_token);
    setKdfSalt(data.kdf_salt);
    setMasterPassword(password);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_salt');
    setToken(null);
    setMasterPassword('');
    setKdfSalt(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, masterPassword, kdfSalt, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

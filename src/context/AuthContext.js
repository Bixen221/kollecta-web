'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('kollecta_token');
    if (token) {
      api.get('/auth/moi')
        .then((res) => setUser(res.user))
        .catch(() => localStorage.removeItem('kollecta_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const connexion = async (whatsapp, password) => {
    const res = await api.post('/auth/connexion', { whatsapp, password });
    localStorage.setItem('kollecta_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const inscription = async (data) => {
    const res = await api.post('/auth/inscription', data);
    localStorage.setItem('kollecta_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const deconnexion = () => {
    localStorage.removeItem('kollecta_token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, connexion, inscription, deconnexion, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

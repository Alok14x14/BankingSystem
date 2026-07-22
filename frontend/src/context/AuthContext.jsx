import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bankUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persistUser = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('bankUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('bankUser');
    }
  }, []);

  const loginUser = useCallback(async ({ email, password }) => {
    const result = await api.login({ email, password });
    persistUser(result.data);
    return result;
  }, [persistUser]);

  const registerUser = useCallback(async ({ name, email, password }) => {
    const result = await api.register({ name, email, password });
    // After register, the backend returns user data and sets cookie
    persistUser({ email: result.data.email, name: result.data.name });
    return result;
  }, [persistUser]);

  const logoutUser = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Even if logout API fails, clear local state
    }
    persistUser(null);
  }, [persistUser]);

  const value = {
    user,
    isAuthenticated: !!user,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

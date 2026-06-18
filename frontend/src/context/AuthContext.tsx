import React, { createContext, useContext, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { logout } from '../store/slices/authSlice';

/** Type utilisateur aligné sur authSlice local (pas d'auth SaaS). */
type LocalUser = {
  id: string; email: string; display_name: string; role: string; is_active: boolean;
};

interface AuthContextType {
  user: LocalUser | null;
  isLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const value = useMemo<AuthContextType>(() => ({
    user: user as LocalUser | null,
    isLoading: false,
    signOut: () => dispatch(logout()),
  }), [dispatch, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleSession = (currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        dispatch(setCredentials({
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            display_name: currentSession.user.user_metadata?.display_name || currentSession.user.email?.split('@')[0] || 'User',
            role: 'analyst',
            is_active: true,
            google_id: null,
            created_at: currentSession.user.created_at,
            last_login: currentSession.user.last_sign_in_at || new Date().toISOString(),
          },
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token
        }));
      } else {
        dispatch(logout());
      }
      
      setIsLoading(false);
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isLocalMode = !supabaseUrl || supabaseUrl === 'https://votre-projet.supabase.co' || import.meta.env.VITE_LOCAL_DEV_MODE === 'true';

    if (isLocalMode) {
      console.warn("⚠️ Mode local/démo activé : authentification Supabase contournée.");
      const mockSession = {
        access_token: 'local-demo-token',
        refresh_token: 'local-demo-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: 'dev-admin',
          app_metadata: {},
          user_metadata: { display_name: 'Admin Local' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'admin@openstats.local',
        }
      } as any;
      handleSession(mockSession);
      return;
    }

    // Obtenir la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Écouter les changements d'état de l'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

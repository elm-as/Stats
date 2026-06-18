import { createSlice } from '@reduxjs/toolkit';

/**
 * Slice minimal en mode open-source local.
 * Les champs "user" / "accessToken" / "activeWorkspaceId" sont conservés
 * pour compatibilité avec l'UI existante (Layout, ProtectedRoute, etc.)
 * mais sans logique de persistance ni auth réelle.
 *
 * Cf. ARCHITECTURE.md — réactiver AUTH_ENABLED=true pour réactiver l'auth SaaS.
 */
interface AuthState {
  user: { id: string; email: string; display_name: string; role: string; is_active: boolean } | null;
  accessToken: null;
  refreshToken: null;
  activeWorkspaceId: null;
}

const LOCAL_USER: NonNullable<AuthState['user']> = {
  id: 'local',
  email: 'local@openstats.app',
  display_name: 'Utilisateur local',
  role: 'analyst',
  is_active: true,
};

const initialState: AuthState = {
  user: LOCAL_USER,
  accessToken: null,
  refreshToken: null,
  activeWorkspaceId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Stub conservé pour compatibilité — aucun effet en mode local. */
    setCredentials() {},
    /** Stub conservé pour compatibilité — aucun effet en mode local. */
    updateAccessToken() {},
    /** Stub conservé pour compatibilité — aucun effet en mode local. */
    setActiveWorkspace() {},
    /** Stub conservé pour compatibilité — aucun effet en mode local. */
    logout() {},
  },
});

export const { setCredentials, updateAccessToken, setActiveWorkspace, logout } = authSlice.actions;
export default authSlice.reducer;

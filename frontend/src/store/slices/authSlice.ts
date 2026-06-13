import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeWorkspaceId: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  activeWorkspaceId: localStorage.getItem('active_workspace_id'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; access_token: string; refresh_token: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      localStorage.setItem('access_token', action.payload.access_token);
      localStorage.setItem('refresh_token', action.payload.refresh_token);
    },
    updateAccessToken(state, action: PayloadAction<{ access_token: string; user: AuthUser }>) {
      state.accessToken = action.payload.access_token;
      state.user = action.payload.user;
      localStorage.setItem('access_token', action.payload.access_token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    setActiveWorkspace(state, action: PayloadAction<string | null>) {
      state.activeWorkspaceId = action.payload;
      if (action.payload) {
        localStorage.setItem('active_workspace_id', action.payload);
      } else {
        localStorage.removeItem('active_workspace_id');
      }
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.activeWorkspaceId = null;
      localStorage.removeItem('auth_user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('active_workspace_id');
    },
  },
});

export const { setCredentials, updateAccessToken, setActiveWorkspace, logout } = authSlice.actions;
export default authSlice.reducer;

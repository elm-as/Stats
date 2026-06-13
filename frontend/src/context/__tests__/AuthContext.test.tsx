import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import React from 'react';
import { supabase } from '../../lib/supabaseClient';

// Mock du client Supabase
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn(),
    }
  }
}));

const TestComponent = () => {
  const context = useAuth();
  
  if (context.isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <span data-testid="auth-status">{context.user ? 'Logged In' : 'Logged Out'}</span>
      {context.user && <span data-testid="user-email">{context.user.email}</span>}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fournit les valeurs par défaut (non authentifié)', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: null },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initialement isLoading = true
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    });
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('affiche les informations de l\'utilisateur connecté', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { 
        session: { 
          user: { id: '123', email: 'test@openstats.ai', role: 'authenticated' } 
        } 
      },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@openstats.ai');
    });
  });
});

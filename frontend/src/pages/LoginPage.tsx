import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import logoOS from '../assets/logoOS.png';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 bg-grid flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-glow-cyan opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoOS} alt="OpenStats" className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-surface-50">Connexion</h1>
          <p className="text-surface-400 text-sm mt-1">Accédez à votre espace avec Supabase</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-surface-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-800/50 border border-surface-700/50 rounded-xl pl-10 pr-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-400/40 transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-surface-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-800/50 border border-surface-700/50 rounded-xl pl-10 pr-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-400/40 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-center text-sm text-surface-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-accent-400 hover:text-accent-300 transition-colors">
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

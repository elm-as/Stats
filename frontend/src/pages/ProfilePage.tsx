import { useState, useEffect } from 'react';
import { User, Settings, Shield, Bell, Save, CheckCircle, Key } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useUpdateProfileMutation } from '../store/api';
import { updateAccessToken } from '../store/slices/authSlice';

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // AI Keys state
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);

  useEffect(() => {
    // Charger les clés API depuis le localStorage
    setOpenaiKey(localStorage.getItem('openai_api_key') || '');
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    try {
      const res = await updateProfile({ display_name: displayName }).unwrap();
      dispatch(updateAccessToken({ access_token: localStorage.getItem('access_token') || '', user: res.user }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  const handleSaveAiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
    else localStorage.removeItem('openai_api_key');
    
    if (geminiKey) localStorage.setItem('gemini_api_key', geminiKey);
    else localStorage.removeItem('gemini_api_key');
    
    setAiSuccess(true);
    setTimeout(() => setAiSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-surface-50 mb-2">Mon Profil</h1>
        <p className="text-surface-400">Gérez vos informations personnelles et vos préférences IA</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Tabs */}
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'general' ? 'bg-accent-400/10 text-accent-400' : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
            }`}
          >
            <User className="w-4 h-4" />
            Informations générales
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'ai' ? 'bg-accent-400/10 text-accent-400' : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Fournisseurs d'IA (BYOK)
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-surface-400 hover:bg-surface-800/50 hover:text-surface-200 transition-all opacity-50 cursor-not-allowed">
            <Settings className="w-4 h-4" />
            Préférences
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-surface-400 hover:bg-surface-800/50 hover:text-surface-200 transition-all opacity-50 cursor-not-allowed">
            <Shield className="w-4 h-4" />
            Sécurité
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'general' && (
            <>
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {user?.display_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-50">{user?.display_name || 'Utilisateur'}</h3>
                    <p className="text-sm text-surface-400">{user?.email}</p>
                  </div>
                </div>

                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Profil mis à jour avec succès
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-surface-300 mb-1.5">Nom d'affichage</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-400/40 transition-all"
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-surface-300 mb-1.5">Email (non modifiable)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-surface-800/30 border border-surface-700/50 rounded-xl px-4 py-2.5 text-surface-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-surface-300 mb-1.5">Rôle</label>
                    <input
                      type="text"
                      value={user?.role || 'Utilisateur Standard'}
                      disabled
                      className="w-full bg-surface-800/30 border border-surface-700/50 rounded-xl px-4 py-2.5 text-surface-500 cursor-not-allowed capitalize"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-700/50">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>

              <div className="glass rounded-2xl p-6 border-red-500/10">
                <h4 className="text-red-400 font-semibold mb-2">Zone de danger</h4>
                <p className="text-sm text-surface-400 mb-4">La suppression de votre compte est définitive et entraînera la perte de toutes vos données.</p>
                <button className="text-red-400 text-sm font-medium hover:text-red-300 transition-colors">
                  Supprimer mon compte
                </button>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <form onSubmit={handleSaveAiKeys} className="glass rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-50 mb-2">Clés API d'Intelligence Artificielle</h3>
                <p className="text-sm text-surface-400">
                  Renseignez vos propres clés API pour débloquer les fonctionnalités d'analyse générative sans aucune limite. Ces clés sont stockées localement sur votre navigateur.
                </p>
              </div>

              {aiSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Clés API sauvegardées avec succès
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-surface-300 mb-1.5">OpenAI API Key</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-400/40 transition-all font-mono"
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-surface-500 mt-1">Nécessaire pour l'analyse NLP et les explications statistiques complexes.</p>
                </div>

                <div>
                  <label className="block text-sm text-surface-300 mb-1.5">Google Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-400/40 transition-all font-mono"
                    placeholder="AIza..."
                  />
                  <p className="text-xs text-surface-500 mt-1">Utilisé pour la génération de rapports rapides et les insights multimodaux.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-700/50">
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder les clés
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

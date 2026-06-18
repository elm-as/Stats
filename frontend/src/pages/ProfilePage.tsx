import { useEffect, useState } from 'react';
import { CheckCircle, Cpu, Key, Save, Settings } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general');
  const [success, setSuccess] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [llmEnabled, setLlmEnabled] = useState(true);
  const [compactCharts, setCompactCharts] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  useEffect(() => {
    setOpenaiKey(localStorage.getItem('openai_api_key') || '');
    setGeminiKey(localStorage.getItem('gemini_api_key') || '');
    setLlmEnabled(localStorage.getItem('llm_enabled') !== 'false');
    setCompactCharts(localStorage.getItem('compact_charts') === 'true');
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('llm_enabled', String(llmEnabled));
    localStorage.setItem('compact_charts', String(compactCharts));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
        <h1 className="text-3xl font-bold text-surface-50 mb-2">Paramètres locaux</h1>
        <p className="text-surface-400">Réglez OpenStats pour votre machine, sans compte utilisateur et sans dépendance SaaS obligatoire.</p>
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
            <Settings className="w-4 h-4" />
            Logiciel
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === 'ai' ? 'bg-accent-400/10 text-accent-400' : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
            }`}
          >
            <Key className="w-4 h-4" />
            IA locale / BYOK
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'general' && (
            <>
              <form onSubmit={handleSaveGeneral} className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-surface-50">Instance locale</h3>
                    <p className="text-sm text-surface-400">Mode simple, local-first, sans comptes.</p>
                  </div>
                </div>

                {success && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Paramètres locaux mis à jour
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-xl border border-surface-700/50 bg-surface-800/30 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={llmEnabled}
                      onChange={(e) => setLlmEnabled(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm text-surface-100 font-medium">Activer les fonctions IA optionnelles</div>
                      <p className="text-xs text-surface-400 mt-1">Désactive les appels aux fournisseurs externes et garde OpenStats en mode purement local.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-surface-700/50 bg-surface-800/30 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={compactCharts}
                      onChange={(e) => setCompactCharts(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-sm text-surface-100 font-medium">Mode graphiques compacts</div>
                      <p className="text-xs text-surface-400 mt-1">Réduit l’encombrement visuel et aide sur les petites machines ou écrans.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-6 border-t border-surface-700/50">
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2.5 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer les paramètres
                  </button>
                </div>
              </form>

              <div className="glass rounded-2xl p-6 border-emerald-500/10">
                <h4 className="text-emerald-400 font-semibold mb-2">Philosophie du projet</h4>
                <p className="text-sm text-surface-400">
                  Cette version est pensée pour une utilisation locale, ouverte et simple. Pas de comptes, pas d’abonnement, pas de verrouillage serveur.
                </p>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <form onSubmit={handleSaveAiKeys} className="glass rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-surface-50 mb-2">Clés API d'Intelligence Artificielle</h3>
                <p className="text-sm text-surface-400">
                  Optionnel : utilisez vos propres clés API si vous voulez des fonctions génératives. Elles restent stockées localement dans votre navigateur.
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
                  <p className="text-xs text-surface-500 mt-1">Utile pour les explications statistiques avancées et certains résumés automatiques.</p>
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
                  <p className="text-xs text-surface-500 mt-1">Optionnel pour tester un autre fournisseur d’IA sans rien imposer au projet.</p>
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

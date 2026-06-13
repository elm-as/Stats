import React from 'react';
import { Play, ShieldCheck, AlertTriangle, Zap, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useListDatasetsQuery, useExecuteAutoPipelineMutation } from '../../store/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/Toast';
import { extractErrorMessage } from '../ui/errorMessage';

export default function AnalyzerPipeline() {
  const { data: datasets } = useListDatasetsQuery();
  const [executeAutoPipeline, { isLoading }] = useExecuteAutoPipelineMutation();
  const navigate = useNavigate();
  const toast = useToast();

  const steps = [
    {
      id: 1,
      title: "Nettoyage des données",
      description: "Présence de 0 doublons, 1 colonnes trop manquantes, 0 quasi-constantes.",
      color: "bg-amber-500",
      optional: false,
    },
    {
      id: 2,
      title: "Statistiques descriptives",
      description: "Vue d'ensemble : distributions, tendances centrales, dispersion.",
      color: "bg-emerald-500",
      optional: false,
    },
    {
      id: 3,
      title: "Matrice de corrélation",
      description: "Variables numériques disponibles analysées.",
      color: "bg-emerald-400",
      optional: false,
    },
    {
      id: 4,
      title: "Recommandations de transformation",
      description: "Identifie les variables nécessitant log/standardisation/Box-Cox.",
      color: "bg-pink-500",
      optional: true,
    },
    {
      id: 5,
      title: "Modélisation prédictive (binary classification)",
      description: "Cible détectée : `Survived` (confiance 100/100). Mode compétitif avec validation croisée.",
      color: "bg-violet-500",
      optional: false,
    },
    {
      id: 6,
      title: "Explicabilité SHAP",
      description: "Interprétation des prédictions par SHAP : feature importance + impacts locaux.",
      color: "bg-indigo-500",
      optional: true,
    },
    {
      id: 7,
      title: "Génération d'insights narratifs",
      description: "Transforme les résultats numériques en interprétations actionnables.",
      color: "bg-purple-500",
      optional: false,
    },
    {
      id: 8,
      title: "Rapport PDF/DOCX",
      description: "Génère un rapport complet avec insights, graphiques et recommandations.",
      color: "bg-red-500",
      optional: true,
    }
  ];

  const handleAnalyze = async () => {
    if (!datasets || datasets.length === 0) {
      toast.error({ title: "Aucun dataset", description: "Veuillez d'abord uploader un dataset." });
      navigate('/workflow');
      return;
    }
    
    // Pour la V1, on prend le premier dataset disponible (titanic par exemple)
    const datasetId = datasets[0].id;

    try {
      toast.info({ title: "Démarrage...", description: "Lancement du pipeline automatique..." });
      await executeAutoPipeline({ 
        id: datasetId, 
        target: "Survived", // Valeur par défaut pour la démo
        execute_optional: true 
      }).unwrap();
      
      toast.success({ title: "Succès", description: "Le pipeline a été exécuté. Redirection vers les résultats..." });
      // Redirection vers l'étape d'analyse du workflow qui contient les résultats
      navigate(`/workflow/${datasetId}/analyze`);
    } catch (error) {
      toast.error({ title: "Erreur", description: extractErrorMessage(error) });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-surface-950">
      {/* Header Summary */}
      <div className="p-6 border-b border-white/5 bg-surface-900/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-3">
              <AlertTriangle size={16} />
              1 colonne(s) avec &gt;50% de valeurs manquantes : Cabin
            </div>
            <h1 className="text-2xl font-black text-surface-50 mb-1">Classification : prédire <span className="text-accent-400 font-mono bg-accent-500/10 px-2 py-0.5 rounded ml-1">Survived</span></h1>
            <p className="text-surface-400">Pipeline de classification binaire généré automatiquement.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Confiance élevée
            </div>
            <div className="text-sm font-mono text-surface-500 flex items-center gap-1">
              <Zap size={14} /> ~25s estimé
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Steps List */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32 relative">
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line connecting steps */}
          <div className="absolute left-[23px] top-4 bottom-10 w-0.5 bg-white/10 z-0" />

          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex gap-6 mb-6 group">
              <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-black text-surface-950 text-lg shadow-lg ${step.color} shadow-${step.color.replace('bg-', '')}/20 group-hover:scale-110 transition-transform`}>
                {step.id}
              </div>
              <div className="flex-1 p-4 rounded-xl bg-surface-800/50 border border-white/5 hover:bg-surface-800 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-surface-100">{step.title}</h3>
                  {step.optional && (
                    <span className="text-[10px] uppercase tracking-wider text-surface-500 border border-surface-600/50 px-2 py-0.5 rounded-full">
                      Optionnel
                    </span>
                  )}
                </div>
                <p className="text-sm text-surface-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface-950 via-surface-950 to-transparent pointer-events-none flex justify-center">
        <button 
          onClick={handleAnalyze}
          disabled={isLoading}
          className="pointer-events-auto px-8 py-4 rounded-full bg-accent-500 hover:bg-accent-400 disabled:opacity-50 disabled:hover:bg-accent-500 disabled:cursor-not-allowed text-surface-950 font-black text-lg shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Analyse en cours...
            </>
          ) : (
            <>
              <Play fill="currentColor" size={24} /> 
              Analyser pour moi
            </>
          )}
        </button>
      </div>
    </div>
  );
}

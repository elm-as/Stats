import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import ResultsWizard from '../components/ResultsWizard';
import { ArrowLeft } from 'lucide-react';

export default function AnalyzerResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { autoPipelineExecution?: any, datasetId?: string } | null;

  if (!state?.autoPipelineExecution || !state?.datasetId) {
    return <Navigate to="/analyzer" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 w-full pb-12 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/analyzer')}
          className="p-2 hover:bg-white/5 rounded-lg text-surface-400 hover:text-surface-200 transition-colors"
          title="Retour à l'analyseur"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Résultats de l'Analyseur</h1>
          <p className="text-surface-400 text-sm mt-1">Détails de l'exécution du pipeline automatique</p>
        </div>
      </div>
      
      <ResultsWizard 
        datasetId={state.datasetId} 
        execution={state.autoPipelineExecution} 
        onReset={() => navigate('/analyzer')}
        onLowCode={() => navigate('/canvas')}
      />
    </div>
  );
}

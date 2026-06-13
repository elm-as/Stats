import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListDatasetsQuery } from '../store/api';
import AutoPipelinePanel from '../components/AutoPipelinePanel';
import InsightsPanel from '../components/InsightsPanel';
import DataPrepPanel from '../components/DataPrepPanel';
import { Activity, Sparkles, Settings2, Database } from 'lucide-react';

export default function AnalyzerPage() {
  const { data: datasets, isLoading } = useListDatasetsQuery();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'prep'>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const datasetId = datasets?.[0]?.id;

  if (!datasetId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-400 animate-fade-in">
        <Database className="w-16 h-16 text-surface-500 mb-4 opacity-50" />
        <p className="text-lg">Aucun dataset disponible.</p>
        <button onClick={() => navigate('/workflow')} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-accent-400 hover:text-accent-300 transition-colors">
          Importer un dataset
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animate-fade-in">
      {/* Header & Tabs */}
      <div className="mb-8 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-surface-50 to-surface-400">Analyseur Intelligent</h1>
            <p className="text-surface-400 text-sm mt-2">Explorez, interprétez et préparez vos données en quelques clics.</p>
          </div>
          
          <div className="flex p-1 bg-surface-900/50 rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-surface-800 text-accent-300 shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <Activity className="w-4 h-4" /> Vue d'ensemble
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'insights' ? 'bg-surface-800 text-accent-300 shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <Sparkles className="w-4 h-4" /> Insights
            </button>
            <button 
              onClick={() => setActiveTab('prep')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'prep' ? 'bg-surface-800 text-accent-300 shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <Settings2 className="w-4 h-4" /> Préparation
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="animate-fade-in-up">
            <AutoPipelinePanel 
              datasetId={datasetId} 
              onComplete={(execution) => {
                if (execution) {
                  navigate(`/analyzer/results`, { state: { autoPipelineExecution: execution, datasetId } });
                }
              }} 
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="animate-fade-in-up">
            <InsightsPanel datasetId={datasetId} />
          </div>
        )}

        {activeTab === 'prep' && (
          <div className="animate-fade-in-up">
            <DataPrepPanel datasetId={datasetId} />
          </div>
        )}
      </div>
    </div>
  );
}

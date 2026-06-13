import { Link, useNavigate } from 'react-router-dom';
import { useDeleteDatasetMutation, useListDatasetsQuery } from '../store/api';
import { Upload, Database, Clock, ArrowRight, Activity, Sigma, Trash2, Zap, BarChart3, ShieldCheck, Info, Network } from 'lucide-react';
import logoOS from '../assets/logoOS.png';
import { useToast } from '../components/ui/Toast';
import { extractErrorMessage } from '../components/ui/errorMessage';

export default function Dashboard() {
  const { data: datasets, isLoading } = useListDatasetsQuery();
  const [deleteDataset, { isLoading: isDeleting }] = useDeleteDatasetMutation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleDelete = async (datasetId: string, datasetName: string) => {
    const confirmed = window.confirm(`Supprimer définitivement le dataset "${datasetName}" ?`);
    if (!confirmed) return;

    try {
      await deleteDataset(datasetId).unwrap();
      toast.success({ title: 'Dataset supprimé', description: `"${datasetName}" a été retiré.` });
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error({ title: 'Suppression échouée', description: extractErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-surface-900 border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute inset-0 bg-hex opacity-40" />
        
        <div className="relative z-10 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 mb-3">
              <Zap className="w-3 h-3 text-accent-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-400">Intelligence Artificielle v1.0</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-[1.1] mb-3">
              From <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-secondary-500">DATA</span>{' '}
              to <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-accent-400">SYSTEMS.</span>
            </h1>
            
            <p className="text-surface-400 text-[13px] md:text-sm mb-5 leading-relaxed max-w-lg">
              Démocratisez l'analyse de données. Ingestion, profilage, nettoyage et modélisation 
              no-code pilotés par une IA de pointe.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link to="/workflow" className="btn-primary">
                <Upload className="w-4 h-4" />
                Démarrer une analyse
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="btn-secondary">
                <Info className="w-4 h-4" />
                Documentation
              </button>
            </div>
          </div>

          <div className="relative hidden xl:block">
            <div className="absolute inset-0 bg-accent-500/20 blur-[80px] rounded-full animate-pulse" />
            <div className="relative card-premium p-[1px] w-48 h-48 rotate-3 hover:rotate-0 transition-transform duration-700 animate-float">
              <div className="flex flex-col items-center justify-center gap-3">
                <img src={logoOS} alt="OpenStats" className="w-20 h-20 object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]" />
                <div className="text-center">
                  <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest">Powered by</p>
                  <p className="text-xs font-black text-white tracking-tight">ELMAS LABS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Datasets Actifs', value: datasets?.length ?? 0, icon: Database, color: 'text-accent-400', bg: 'bg-accent-400/10' },
          { label: 'Modèles ML', value: '24', icon: Activity, color: 'text-secondary-400', bg: 'bg-secondary-400/10' },
          { label: 'Tests Stats', value: '12', icon: Sigma, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Fiabilité IA', value: '99.9%', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((stat, i) => (
          <div key={stat.label} className="card !p-3 md:!p-4 flex items-center gap-3 group" style={{ transitionDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl md:text-2xl font-black text-white num leading-tight">{stat.value}</p>
              <p className="text-[9px] md:text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-0.5 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Layout: Datasets & Canvas Shortcut */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Datasets Section */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-accent-500 rounded-full" />
              <h3 className="text-base md:text-lg font-black text-white tracking-tight">Bibliothèque de Données</h3>
            </div>
            <Link to="/workflow" className="text-xs font-bold text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1.5">
              Tout voir <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-32 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : datasets && datasets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {datasets.map((ds) => (
                <div key={ds.id} className="card group hover:border-accent-500/30 !p-0 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent-500/10 transition-colors">
                        <BarChart3 className="w-4 h-4 text-surface-400 group-hover:text-accent-400 transition-colors" />
                      </div>
                      <button
                        onClick={() => handleDelete(ds.id, ds.name)}
                        className="p-1.5 rounded-md text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <Link to={`/workflow/${ds.id}/profile`} className="block">
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-accent-400 transition-colors truncate">
                        {ds.name}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-surface-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {ds.shape.rows.toLocaleString()}L</span>
                        <span className="flex items-center gap-1"><Sigma className="w-3 h-3" /> {ds.shape.columns}C</span>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-surface-600 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {new Date(ds.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <Link 
                      to={`/workflow/${ds.id}/profile`} 
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-400 group-hover:translate-x-1 transition-transform"
                    >
                      Ouvrir →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card py-12 md:py-16 flex flex-col items-center justify-center text-center border-dashed border-white/10 bg-transparent">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Database className="w-7 h-7 text-surface-600" />
              </div>
              <h4 className="text-lg font-black text-white mb-1.5">Aucune donnée détectée</h4>
              <p className="text-surface-500 text-[13px] max-w-sm mb-5">
                Votre espace de travail est vide. Importez votre premier dataset pour commencer l'analyse.
              </p>
              <Link to="/workflow" className="btn-primary">
                Uploader mon premier fichier
              </Link>
            </div>
          )}
        </div>

        {/* Canvas Shortcut Section */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-secondary-500 rounded-full" />
            <h3 className="text-base md:text-lg font-black text-white tracking-tight">Outils Visuels</h3>
          </div>
          
          <Link to="/canvas" className="block relative overflow-hidden card group !p-0 hover:border-secondary-500/50 transition-all h-[calc(100%-2.5rem)] min-h-[200px]">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Network className="w-6 h-6 text-secondary-400" />
                </div>
                <h4 className="text-lg font-black text-white mb-2 group-hover:text-secondary-400 transition-colors">
                  Canvas Interactif
                </h4>
                <p className="text-xs text-surface-400 leading-relaxed mb-6">
                  Créez vos pipelines d'analyse visuellement en glissant-déposant des blocs.
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-secondary-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                Lancer l'éditeur <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            {/* Background nodes decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-500/5 rounded-full blur-xl group-hover:bg-secondary-500/10 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}

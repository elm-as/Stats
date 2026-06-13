import { useState, useEffect, useRef } from 'react';
import {
  Wand2, Target, Zap, Clock, CheckCircle2, XCircle, Loader2,
  ChevronRight, Sparkles, AlertCircle, RefreshCw, Play, Cpu,
  Activity,
} from 'lucide-react';
import { api } from '../store/api';
import ResultsWizard from './ResultsWizard';
import LowCodeCanvas from './LowCodeCanvas';

interface Props {
  datasetId: string;
  onComplete?: (execution?: any) => void;
}

const PROBLEM_LABEL: Record<string, { label: string; icon: typeof Target; color: string }> = {
  regression: { label: 'Régression', icon: Target, color: 'text-blue-400' },
  binary_classification: { label: 'Classification binaire', icon: Target, color: 'text-emerald-400' },
  multiclass_classification: { label: 'Classification multi-classe', icon: Target, color: 'text-emerald-400' },
  forecast: { label: 'Prévision', icon: Cpu, color: 'text-purple-400' },
  exploration: { label: 'Exploration', icon: Sparkles, color: 'text-accent-400' },
};

const CONFIDENCE_META: Record<string, { color: string; label: string }> = {
  high: { color: 'text-emerald-400', label: 'Confiance élevée' },
  medium: { color: 'text-amber-400', label: 'Confiance modérée' },
  low: { color: 'text-orange-400', label: 'Confiance faible' },
};

export default function AutoPipelinePanel({ datasetId, onComplete }: Props) {
  const [executed, setExecuted] = useState(false);
  const [canvasMode, setCanvasMode] = useState(false);
  const [includeOptional, setIncludeOptional] = useState(false);
  const [manualTarget, setManualTarget] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: detection, isLoading: isDetecting, refetch: refetchDetect } =
    api.useDetectPipelineQuery({ id: datasetId });

  const [buildRecipe, { data: recipeData, isLoading: isBuilding }] =
    api.useBuildPipelineRecipeMutation();

  const [execute, { data: execResult, isLoading: isExecuting }] =
    api.useExecuteAutoPipelineMutation();

  const profile = detection?.profile;
  const recipe = recipeData?.recipe;
  const execution = execResult?.execution;

  const effectiveTarget = manualTarget ?? profile?.suggested_target ?? null;

  // Elapsed timer during execution
  useEffect(() => {
    if (isExecuting) {
      setElapsed(0);
      setCurrentStepIdx(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isExecuting]);

  // Animate step progress optimistically during execution
  const liveSteps = recipeData?.recipe?.steps ?? (detection && buildRecipeFromProfile(profile));
  const totalSteps = liveSteps?.length ?? 0;
  useEffect(() => {
    if (!isExecuting || totalSteps === 0) return;
    const avgStepMs = ((profile?.suggested_target ? 25 : 10) * 1000) / Math.max(totalSteps, 1);
    stepTimerRef.current = setInterval(() => {
      setCurrentStepIdx(i => Math.min(i + 1, totalSteps - 1));
    }, avgStepMs);
    return () => { if (stepTimerRef.current) clearInterval(stepTimerRef.current); };
  }, [isExecuting, totalSteps]);

  // Build recipe automatiquement quand on a le profile
  const handleBuildRecipe = async () => {
    await buildRecipe({ id: datasetId, target: effectiveTarget ?? undefined }).unwrap();
  };

  const [execError, setExecError] = useState<string | null>(null);

  const handleExecute = async () => {
    setExecError(null);
    setExecuted(false);
    let currentRecipe = recipe;
    try {
      if (!currentRecipe) {
        const res = await buildRecipe({ id: datasetId, target: effectiveTarget ?? undefined }).unwrap();
        if (!res.recipe) return;
        currentRecipe = res.recipe;
      }
      setCurrentStepIdx(0);
      const result = await execute({ id: datasetId, target: effectiveTarget ?? undefined, execute_optional: includeOptional }).unwrap();
      setCurrentStepIdx(currentRecipe.steps.length);
      setExecuted(true);
      onComplete?.(result.execution);
    } catch (err: any) {
      setExecError(err?.data?.error ?? err?.message ?? 'Erreur inconnue lors de l\'exécution');
      setExecuted(true);
    }
  };

  if (isDetecting) {
    return (
      <div className="bg-surface-800/60 backdrop-blur border border-white/10 rounded-xl p-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
        <span className="text-sm text-gray-400">Analyse du dataset…</span>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const problemMeta = PROBLEM_LABEL[profile.problem_type] ?? PROBLEM_LABEL.exploration;
  const ProblemIcon = problemMeta.icon;

  return (
    <div className="bg-gradient-to-br from-surface-800/80 to-surface-900/80 backdrop-blur border border-accent-500/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-accent-500/10 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Wand2 className="w-6 h-6 text-accent-400" />
              <div className="absolute inset-0 bg-accent-400 blur-lg opacity-40 -z-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Analyseur intelligent
                <span className="text-xs font-normal text-accent-400 px-2 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/30">
                  IA
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Détection automatique du problème et exécution du pipeline optimal
              </p>
            </div>
          </div>
          <button
            onClick={() => refetchDetect()}
            className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
            title="Re-détecter"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Profile détecté */}
      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox icon={ProblemIcon} label="Problème détecté" value={problemMeta.label} color={problemMeta.color} />
          <StatBox
            icon={Target}
            label="Cible suggérée"
            value={effectiveTarget ? <code className="text-accent-300">{effectiveTarget}</code> : <span className="text-gray-500">aucune</span>}
            color="text-accent-400"
          />
          <StatBox
            icon={Zap}
            label="Variables"
            value={`${profile.numeric_cols.length}N · ${profile.categorical_cols.length}C · ${profile.temporal_cols.length}T`}
            color="text-blue-400"
          />
          <StatBox
            icon={Sparkles}
            label="Observations"
            value={profile.n_rows.toLocaleString()}
            color="text-purple-400"
          />
        </div>

        {/* Stationarity summary pill (temporal datasets only) */}
        {profile.has_temporal && profile.stationarity_summary && profile.stationarity_summary !== 'unknown' && (() => {
          const S: Record<string, { label: string; cls: string }> = {
            all_stationary:    { label: 'I(0) — stationnaire',          cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' },
            all_nonstationary: { label: profile.cointegration_likely ? 'I(1) — cointégration probable → VECM' : 'I(1) — non-stationnaire', cls: profile.cointegration_likely ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300' },
            mixed:             { label: 'I(0)/I(1) mixte → ARDL',       cls: 'bg-blue-500/10 border-blue-500/30 text-blue-300' },
          };
          const m = S[profile.stationarity_summary];
          if (!m) return null;
          return (
            <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${m.cls}`}>
              <Activity className="w-3 h-3" />
              Stationnarité : {m.label}
            </div>
          );
        })()}

        {/* Candidate target override */}
        {profile.candidate_targets && profile.candidate_targets.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Changer la cible :</span>
            {profile.candidate_targets.slice(0, 6).map((c) => (
              <button
                key={c.column}
                onClick={() => setManualTarget(c.column === profile.suggested_target && manualTarget === null ? null : c.column)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  effectiveTarget === c.column
                    ? 'bg-accent-500/20 border-accent-500/50 text-accent-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-accent-500/30 hover:text-gray-300'
                }`}
              >
                {c.column}
                <span className="ml-1 opacity-50 text-[10px]">{c.type}</span>
              </button>
            ))}
            {manualTarget !== null && (
              <button
                onClick={() => setManualTarget(null)}
                className="text-[10px] text-gray-500 hover:text-gray-300 underline"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Notes */}
        {profile.notes && profile.notes.length > 0 && (
          <div className="bg-surface-900/50 rounded-lg p-3 space-y-1">
            {profile.notes.map((note, i) => (
              <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                <span className="text-accent-400 mt-0.5">▸</span>
                <span>{note}</span>
              </p>
            ))}
          </div>
        )}

        {/* Flags */}
        {profile.flags && profile.flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.flags.map(flag => (
              <span key={flag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10 uppercase tracking-wider">
                {flag.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recipe / Execution progress */}
      {recipe && (
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">{recipe.title}</h4>
              <p className="text-xs text-gray-500">{recipe.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {isExecuting ? (
                <span className="text-accent-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {elapsed}s écoulées…
                </span>
              ) : (
                <span className={CONFIDENCE_META[recipe.confidence]?.color}>
                  ● {CONFIDENCE_META[recipe.confidence]?.label}
                </span>
              )}
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~{recipe.estimated_duration_sec}s
              </span>
            </div>
          </div>

          {/* Progress bar */}
          {isExecuting && (
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((currentStepIdx / Math.max(recipe.steps.length - 1, 1)) * 100)}%` }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            {recipe.steps.map((step, i) => {
              const execStep = execution?.steps[step.key];
              const isActive = isExecuting && i === currentStepIdx;
              const isPast = isExecuting && i < currentStepIdx;
              return (
                <StepRow
                  key={step.key}
                  index={i + 1}
                  label={step.label}
                  rationale={step.rationale}
                  optional={step.optional}
                  status={execStep?.status ?? (isActive ? 'running' : isPast ? 'pending' : undefined)}
                  duration={execStep?.duration_ms}
                  error={execStep?.error}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Error banner */}
      {executed && execError && !execution && (
        <div className="mx-5 mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Échec de l'exécution</p>
            <p className="text-xs text-red-300/70 mt-0.5">{execError}</p>
          </div>
        </div>
      )}

      {/* Results Wizard or Low-Code Canvas */}
      {executed && execution && !canvasMode && (
        <div className="px-5 py-4 border-t border-white/10">
          <ResultsWizard
            datasetId={datasetId}
            execution={execution}
            execError={execError}
            onReset={() => {
              setExecuted(false);
              setExecError(null);
              setElapsed(0);
              setCurrentStepIdx(0);
              setCanvasMode(false);
            }}
            onLowCode={() => setCanvasMode(true)}
          />
        </div>
      )}

      {/* Low-Code Canvas Mode */}
      {executed && canvasMode && (
        <div className="px-5 py-4 border-t border-white/10">
          <LowCodeCanvas
            datasetId={datasetId}
            onBack={() => setCanvasMode(false)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-4 border-t border-white/10 bg-surface-900/40 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeOptional}
            onChange={e => setIncludeOptional(e.target.checked)}
            className="accent-accent-500"
          />
          Inclure étapes optionnelles (SHAP, rapport)
        </label>

        <div className="flex gap-2">
          {!recipe && (
            <button
              onClick={handleBuildRecipe}
              disabled={isBuilding}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Construire le pipeline
            </button>
          )}
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-sm font-medium flex items-center gap-2 shadow-glow-sm transition-all disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exécution…
              </>
            ) : executed ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Relancer
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Analyser pour moi
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: {
  icon: typeof Target; label: string; value: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-surface-900/50 rounded-lg p-3 border border-white/5">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${color} mb-1`}>
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-700 truncate">{value}</div>
    </div>
  );
}

function buildRecipeFromProfile(_profile: any) {
  return null;
}

function StepRow({ index, label, rationale, optional, status, duration, error }: {
  index: number;
  label: string;
  rationale: string;
  optional: boolean;
  status?: string;
  duration?: number;
  error?: string;
}) {
  const iconMap: Record<string, JSX.Element> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    skipped: <ChevronRight className="w-4 h-4 text-gray-600" />,
    running: <Loader2 className="w-4 h-4 text-accent-400 animate-spin" />,
    pending: <div className="w-4 h-4 rounded-full border border-dashed border-gray-500 animate-pulse" />,
  };

  const isRunning = status === 'running';
  return (
    <div className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
      status === 'error' ? 'bg-red-500/5' :
      isRunning ? 'bg-accent-500/5 border border-accent-500/20' :
      status === 'success' ? 'bg-emerald-500/5' :
      'hover:bg-white/5'
    }`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] flex-shrink-0 font-mono ${
        status === 'success' ? 'bg-emerald-500/20' :
        status === 'error'   ? 'bg-red-500/20' :
        status === 'skipped' ? 'bg-gray-500/10' :
        isRunning            ? 'bg-accent-500/20 text-accent-300' :
                               'bg-surface-900/70 text-gray-500'
      }`}>
        {status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
         status === 'error'   ? <XCircle className="w-3.5 h-3.5 text-red-400" /> :
         status === 'skipped' ? <ChevronRight className="w-3 h-3 text-gray-500" /> :
         isRunning            ? <Loader2 className="w-3.5 h-3.5 text-accent-400 animate-spin" /> :
                                <span>{index}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${isRunning ? 'text-accent-300 font-medium' : 'text-gray-700'}`}>{label}</span>
          {optional && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 uppercase tracking-wider">
              optionnel
            </span>
          )}
          {duration !== undefined && (
            <span className="text-[10px] text-gray-500">{duration}ms</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{rationale}</p>
        {error && (
          <p className="text-xs text-red-400 mt-1 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 mt-0.5">
        {status && status in iconMap ? iconMap[status] : <div className="w-4 h-4 rounded-full border border-dashed border-gray-700" />}
      </div>
    </div>
  );
}


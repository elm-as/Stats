import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

import Sidebar from './Sidebar';
import {
  DatasetNode,
  TypingNode, CleaningNode, TransformNode, ComputeVariableNode,
  DescriptiveNumericNode, DescriptiveCategoricalNode,
  CorrelationNode, VIFNode,
  TestCompareMeansNode, TestCorrelationNode, TestIndependenceNode, TestStationarityNode,
  PCANode, CANode, MCANode, ClusteringNode,
  RegressionNode, ClassificationNode,
  TimeSeriesNode, MultivariateTimeSeriesNode,
  SimulationNode,
  VisualizationNode,
  AINode, ExtensionNode, InsightsNode, OutputNode,
  CanvasNodeData,
} from './nodes';
import CanvasResultModal from './CanvasResultModal';

const initialNodes: Node[] = [];

const nodeTypes = {
  dataset: DatasetNode,
  typing: TypingNode,
  cleaning: CleaningNode,
  transform: TransformNode,
  computeVariable: ComputeVariableNode,
  descriptiveNumeric: DescriptiveNumericNode,
  descriptiveCategorical: DescriptiveCategoricalNode,
  correlation: CorrelationNode,
  vif: VIFNode,
  testCompareMeans: TestCompareMeansNode,
  testCorrelation: TestCorrelationNode,
  testIndependence: TestIndependenceNode,
  testStationarity: TestStationarityNode,
  pca: PCANode,
  ca: CANode,
  mca: MCANode,
  clustering: ClusteringNode,
  regression: RegressionNode,
  classification: ClassificationNode,
  timeseries: TimeSeriesNode,
  multivariateTimeseries: MultivariateTimeSeriesNode,
  simulation: SimulationNode,
  visualization: VisualizationNode,
  ai: AINode,
  extension: ExtensionNode,
  insights: InsightsNode,
  output: OutputNode,
};

interface NodeResult {
  status: 'success' | 'error' | 'skipped';
  message?: string;
  error?: string;
  result?: unknown;
}

let id = 1;
const getId = () => `node_${id++}`;

function DnDFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Pipeline execution state
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResults, setPipelineResults] = useState<Record<string, NodeResult> | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedResultNode, setSelectedResultNode] = useState<{ id: string; type: string; title: string; result: any } | null>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({
    ...params,
    animated: true,
    style: { stroke: '#38bdf8', strokeWidth: 2 },
  }, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeDataChange = useCallback((nodeId: string, key: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, [key]: value },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Trace path backwards to find the dataset ID
  const getConnectedDatasetId = useCallback((nodeId: string): string | null => {
    let currentId = nodeId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) return null; // Cycle
      visited.add(currentId);

      const node = nodes.find(n => n.id === currentId);
      if (node?.type === 'dataset' && node.data?.file) {
        return node.data.file as string;
      }

      // Find parent
      const parentEdge = edges.find(e => e.target === currentId);
      if (!parentEdge) return null;
      currentId = parentEdge.source;
    }
    return null;
  }, [nodes, edges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { 
          onChange: onNodeDataChange, 
          onDelete: onNodeDelete,
          getConnectedDatasetId // Inject the function here
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDataChange, onNodeDelete, getConnectedDatasetId],
  );

  // ── Pipeline execution ──
  const handleRun = async () => {
    if (nodes.length === 0) return;
    setIsRunning(true);
    setPipelineResults(null);
    setShowResults(false);

    // Build payload — strip callbacks from data
    const pipeline = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        data: Object.fromEntries(
          Object.entries(n.data).filter(([k]) => k !== 'onChange' && k !== 'onDelete')
        ),
      })),
      edges: edges.map(e => ({ source: e.source, target: e.target })),
    };

    // Update node borders to "running" state
    setNodes((nds) => nds.map(n => ({
      ...n,
      style: { ...n.style, outline: '2px solid #38bdf8', outlineOffset: '2px' },
    })));

    try {
      const token = localStorage.getItem('access_token') || '';
      const response = await fetch('/api/v1/canvas/run_pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(pipeline),
      });

      const result = await response.json();

      if (result.success) {
        const nodeResults: Record<string, NodeResult> = result.results || {};
        setPipelineResults(nodeResults);
        setShowResults(true);

        // Color nodes by result status
        setNodes((nds) => nds.map(n => {
          const r = nodeResults[n.id];
          let outlineColor = '#475569'; // default gray
          if (r?.status === 'success') outlineColor = '#10b981';
          else if (r?.status === 'error') outlineColor = '#ef4444';
          else if (r?.status === 'skipped') outlineColor = '#f59e0b';

          return {
            ...n,
            style: {
              ...n.style,
              outline: `2px solid ${outlineColor}`,
              outlineOffset: '2px',
            },
          };
        }));
      } else {
        // Global error
        setPipelineResults({ _global: { status: 'error', error: result.error || 'Erreur inconnue' } });
        setShowResults(true);
        // Reset borders
        setNodes((nds) => nds.map(n => ({
          ...n,
          style: { ...n.style, outline: '2px solid #ef4444', outlineOffset: '2px' },
        })));
      }
    } catch (e) {
      console.error('Pipeline error:', e);
      setPipelineResults({ _global: { status: 'error', error: 'Connexion au serveur échouée' } });
      setShowResults(true);
      setNodes((nds) => nds.map(n => ({
        ...n,
        style: { ...n.style, outline: '2px solid #ef4444', outlineOffset: '2px' },
      })));
    } finally {
      setIsRunning(false);
    }
  };

  const resetResults = () => {
    setPipelineResults(null);
    setShowResults(false);
    setNodes((nds) => nds.map(n => ({
      ...n,
      style: { ...n.style, outline: 'none', outlineOffset: '0' },
    })));
  };

  // Compute summary stats from results
  const summary = pipelineResults ? (() => {
    const entries = Object.entries(pipelineResults).filter(([k]) => k !== '_global');
    return {
      total: entries.length,
      success: entries.filter(([, r]) => r.status === 'success').length,
      error: entries.filter(([, r]) => r.status === 'error').length,
      skipped: entries.filter(([, r]) => r.status === 'skipped').length,
    };
  })() : null;

  // Build display-friendly label for a node ID
  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return nodeId;
    const labels: Record<string, string> = {
      dataset: 'Source', typing: 'Type', cleaning: 'Nettoyage', transform: 'Transf.',
      computeVariable: 'Variable', descriptiveNumeric: 'Desc. Num.', descriptiveCategorical: 'Desc. Cat.',
      correlation: 'Corrélation', vif: 'VIF', testCompareMeans: 'Moyennes', testCorrelation: 'Corr.',
      testIndependence: 'Indép.', testStationarity: 'Stat.',
      pca: 'ACP', ca: 'AFC', mca: 'ACM',
      clustering: 'Clustering', regression: 'Régression', classification: 'Classif.',
      timeseries: 'Séries Temp.', multivariateTimeseries: 'TS Multivarié', simulation: 'Simulation',
      visualization: 'Graphique', ai: 'IA', extension: 'Extension', insights: 'Insights', output: 'Export',
    };
    return labels[node.type || ''] || node.type || nodeId;
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full text-surface-50">
      <Sidebar />
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeDoubleClick={(event, edge) => setEdges((eds) => eds.filter((e) => e.id !== edge.id))}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes as any}
          fitView
          className="bg-surface-950"
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#38bdf8', strokeWidth: 2 },
          }}
        >
          <Background color="#1e293b" gap={24} size={1.5} />
          <Controls className="!bg-surface-800/90 !border !border-white/[0.08] !rounded-xl !shadow-2xl [&>button]:!bg-transparent [&>button]:!border-white/[0.06] [&>button]:!text-surface-300 [&>button:hover]:!bg-white/10 [&>button]:!rounded-lg" />
          <MiniMap
            nodeStrokeColor="#fff"
            nodeColor="#1e293b"
            maskColor="rgba(0,0,0,0.3)"
            className="!bg-surface-800/80 !border !border-white/[0.08] !rounded-xl"
          />
        </ReactFlow>

        {/* ── Run Button ── */}
        <button
          className={`absolute bottom-8 right-8 px-7 py-3.5 rounded-full font-black text-sm shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:-translate-y-1 transition-all flex items-center gap-2.5 z-10 ${
            isRunning
              ? 'bg-surface-600 text-surface-300 cursor-wait'
              : 'bg-accent-500 hover:bg-accent-400 text-surface-950'
          }`}
          onClick={handleRun}
          disabled={isRunning || nodes.length === 0}
        >
          {isRunning ? (
            <><Loader2 size={18} className="animate-spin" /> Exécution en cours...</>
          ) : (
            <><Play fill="currentColor" size={18} /> Exécuter le Workflow</>
          )}
        </button>

        {/* ── Results Panel ── */}
        {showResults && pipelineResults && (
          <div className="absolute top-4 right-4 w-[380px] max-h-[calc(100vh-120px)] overflow-auto z-20 rounded-2xl border border-white/[0.08] bg-surface-900/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {summary && summary.error > 0 ? (
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <XCircle size={16} className="text-red-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-surface-100">Résultats du Pipeline</h3>
                  {summary && (
                    <p className="text-[11px] text-surface-400 mt-0.5">
                      {summary.success} ✓ · {summary.error > 0 ? `${summary.error} ✗ · ` : ''}{summary.skipped > 0 ? `${summary.skipped} ⊘` : ''}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={resetResults}
                className="text-surface-400 hover:text-surface-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                Fermer
              </button>
            </div>

            {/* Global error */}
            {pipelineResults._global && (
              <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20">
                <p className="text-xs text-red-300 font-medium">{pipelineResults._global.error}</p>
              </div>
            )}

            {/* Per-node results */}
            <div className="divide-y divide-white/[0.04]">
              {Object.entries(pipelineResults)
                .filter(([k]) => k !== '_global')
                .map(([nodeId, result]) => (
                <div key={nodeId} className="px-5 py-3 hover:bg-white/[0.02] transition-colors group flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      {result.status === 'success' && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                      {result.status === 'error' && <XCircle size={14} className="text-red-400 shrink-0" />}
                      {result.status === 'skipped' && <AlertCircle size={14} className="text-amber-400 shrink-0" />}
                      <span className="text-xs font-bold text-surface-200">{getNodeLabel(nodeId)}</span>
                    </div>
                    <p className={`text-[11px] mt-1 ml-6 leading-relaxed ${
                      result.status === 'success' ? 'text-surface-400' :
                      result.status === 'error' ? 'text-red-300/80' :
                      'text-amber-300/70'
                    }`}>
                      {result.message || result.error || 'Terminé'}
                    </p>
                  </div>
                  {result.status === 'success' && result.result !== undefined && (
                    <button
                      onClick={() => setSelectedResultNode({
                        id: nodeId,
                        type: nodes.find(n => n.id === nodeId)?.type || '',
                        title: getNodeLabel(nodeId),
                        result: result.result
                      })}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-white/10 text-surface-400 hover:text-accent-400 transition-all shrink-0 mt-1"
                      title="Voir les résultats"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Modal de détails */}
        <CanvasResultModal
          isOpen={!!selectedResultNode}
          onClose={() => setSelectedResultNode(null)}
          nodeTitle={selectedResultNode?.title || ''}
          nodeType={selectedResultNode?.type || ''}
          resultData={selectedResultNode?.result}
        />
      </div>
    </div>
  );
}

export default function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <DnDFlow />
    </ReactFlowProvider>
  );
}

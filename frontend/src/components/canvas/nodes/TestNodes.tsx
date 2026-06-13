import { NodeProps, Node } from '@xyflow/react';
import { GitCompare, Link2, Grid3X3, Activity } from 'lucide-react';
import { 
  CanvasNodeData, NodeShell, NodeLabel, 
  useNodeUpdate, useConnectedColumns, NodeColumnSelect, NodeMultiColumnInput 
} from './_shared';

export function TestCompareMeansNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#ef4444" icon={GitCompare} title="Comparaison de moyennes" hasInput badge="Test">
      <div className="text-surface-400 text-[11px] leading-relaxed mb-2">
        T-test / Mann-Whitney / ANOVA / Kruskal-Wallis (sélection automatique).
      </div>
      <div>
        <NodeLabel>Variable de groupement</NodeLabel>
        <NodeColumnSelect name="groupCol" placeholder="-- Variable groupe --" value={(data.groupCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Variable numérique</NodeLabel>
        <NodeColumnSelect name="valueCol" placeholder="-- Variable valeur --" value={(data.valueCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
    </NodeShell>
  );
}

export function TestCorrelationNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#ef4444" icon={Link2} title="Test de corrélation" hasInput badge="Test">
      <div className="text-surface-400 text-[11px] leading-relaxed mb-2">
        Significativité Pearson / Spearman (p-value).
      </div>
      <div>
        <NodeLabel>Variable 1</NodeLabel>
        <NodeColumnSelect name="col1" placeholder="-- Variable 1 --" value={(data.col1 as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Variable 2</NodeLabel>
        <NodeColumnSelect name="col2" placeholder="-- Variable 2 --" value={(data.col2 as string) || ''} onChange={handleChange} columns={columns} />
      </div>
    </NodeShell>
  );
}

export function TestIndependenceNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#ef4444" icon={Grid3X3} title="Test d'indépendance" hasInput badge="Test">
      <div className="text-surface-400 text-[11px] leading-relaxed mb-2">
        Chi-carré / Fisher (variables catégorielles).
      </div>
      <div>
        <NodeLabel>Variable 1</NodeLabel>
        <NodeColumnSelect name="col1" placeholder="-- Variable 1 --" value={(data.col1 as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Variable 2</NodeLabel>
        <NodeColumnSelect name="col2" placeholder="-- Variable 2 --" value={(data.col2 as string) || ''} onChange={handleChange} columns={columns} />
      </div>
    </NodeShell>
  );
}

export function TestStationarityNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#ef4444" icon={Activity} title="Test de stationnarité" hasInput badge="Test">
      <div className="text-surface-400 text-[11px] leading-relaxed mb-2">
        ADF + KPSS combinés. Conclusion automatique sur l'ordre d'intégration.
      </div>
      <div>
        <NodeLabel>Variables à tester (séparées par une virgule)</NodeLabel>
        <NodeMultiColumnInput name="cols" placeholder="Toutes (auto)" value={(data.cols as string) || ''} onChange={handleChange} columns={columns} />
      </div>
    </NodeShell>
  );
}

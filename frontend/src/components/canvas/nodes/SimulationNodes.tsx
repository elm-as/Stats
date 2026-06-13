import { NodeProps, Node } from '@xyflow/react';
import { PlayCircle } from 'lucide-react';
import { CanvasNodeData, NodeShell, NodeLabel, NodeSelect, useNodeUpdate } from './_shared';

export function SimulationNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  return (
    <NodeShell id={id} data={data} color="#f97316" icon={PlayCircle} title="Simulation & Scénarios" hasInput>
      <div>
        <NodeLabel>Mode</NodeLabel>
        <NodeSelect name="simulationType" value={(data.simulationType as string) || 'prediction'} onChange={handleChange}>
          <option value="prediction">Prédiction unitaire</option>
          <option value="monte_carlo">Simulation de Monte Carlo</option>
          <option value="sensitivity">Analyse de sensibilité</option>
          <option value="tornado">Tornado chart</option>
          <option value="stress_test">Stress test</option>
          <option value="scenarios">Comparaison de scénarios</option>
        </NodeSelect>
      </div>
    </NodeShell>
  );
}

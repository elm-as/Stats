import { NodeProps, Node } from '@xyflow/react';
import { PlayCircle } from 'lucide-react';
import { 
  CanvasNodeData, NodeShell, NodeLabel, NodeSelect, NodeNumberInput,
  useNodeUpdate, NodeToggle, NodeCollapsible, NodeSeedInput
} from './_shared';

export function SimulationNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const mode = (data.mode as string) || 'auto';
  const isAdvanced = mode === 'advanced';
  const simType = (data.simulationType as string) || 'prediction';
  
  return (
    <NodeShell id={id} data={data} color="#f97316" icon={PlayCircle} title="Simulation & Scénarios" hasInput>
      <div>
        <NodeLabel>Mode</NodeLabel>
        <NodeSelect name="simulationType" value={simType} onChange={handleChange}>
          <option value="prediction">Prédiction unitaire</option>
          <option value="monte_carlo">Simulation de Monte Carlo</option>
          <option value="sensitivity">Analyse de sensibilité</option>
          <option value="tornado">Tornado chart</option>
          <option value="stress_test">Stress test</option>
          <option value="scenarios">Comparaison de scénarios</option>
        </NodeSelect>
      </div>
      <div className="flex items-center justify-between pt-1">
        <NodeToggle value={mode} onChange={handleChange} />
        <span className="text-[9px] text-surface-600">
          {isAdvanced ? 'Paramétrable' : 'Défauts optimaux'}
        </span>
      </div>
      {isAdvanced && (
        <NodeCollapsible title="Paramètres de simulation" defaultOpen>
          {simType === 'monte_carlo' && (
            <div>
              <NodeLabel>Nombre de simulations</NodeLabel>
              <NodeNumberInput name="nSimulations" placeholder="1000" value={(data.nSimulations as string) || ''} onChange={handleChange} min={100} max={100000} step={100} />
            </div>
          )}
          {simType === 'sensitivity' && (
            <div className="space-y-2">
              <div>
                <NodeLabel>Nb points</NodeLabel>
                <NodeNumberInput name="nPoints" placeholder="20" value={(data.nPoints as string) || ''} onChange={handleChange} min={5} max={100} />
              </div>
              <div>
                <NodeLabel>Plage de variation (%)</NodeLabel>
                <NodeNumberInput name="rangePct" placeholder="20" value={(data.rangePct as string) || ''} onChange={handleChange} min={1} max={100} />
              </div>
            </div>
          )}
          {simType === 'stress_test' && (
            <div>
              <NodeLabel>Sigmas à tester</NodeLabel>
              <NodeSelect name="sigmas" value={(data.sigmas as string) || '1,2,3'} onChange={handleChange}>
                <option value="1,2,3">±1σ, ±2σ, ±3σ</option>
                <option value="1,2,3,4,5">±1σ à ±5σ</option>
                <option value="2,3">±2σ, ±3σ</option>
              </NodeSelect>
            </div>
          )}
          {(simType === 'tornado' || simType === 'tornado') && (
            <div>
              <NodeLabel>Sigma (amplitude)</NodeLabel>
              <NodeNumberInput name="sigma" placeholder="1" value={(data.sigma as string) || ''} onChange={handleChange} min={0.5} max={5} step={0.5} />
            </div>
          )}
          <NodeSeedInput value={(data.seed as string) || ''} onChange={handleChange} />
        </NodeCollapsible>
      )}
    </NodeShell>
  );
}

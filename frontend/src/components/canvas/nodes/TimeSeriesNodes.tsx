import { NodeProps, Node } from '@xyflow/react';
import { LineChart, Shuffle } from 'lucide-react';
import { 
  CanvasNodeData, NodeShell, NodeLabel, NodeSelect, 
  useNodeUpdate, useConnectedColumns, NodeColumnSelect, NodeMultiColumnInput 
} from './_shared';

export function TimeSeriesNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#f59e0b" icon={LineChart} title="Séries temporelles" hasInput>
      <div>
        <NodeLabel>Modèle</NodeLabel>
        <NodeSelect name="model" value={(data.model as string) || 'auto'} onChange={handleChange}>
          <option value="auto">Auto (meilleur modèle)</option>
          <option value="arima">ARIMA</option>
          <option value="sarima">SARIMA</option>
          <option value="holt">Holt-Winters</option>
        </NodeSelect>
      </div>
      <div>
        <NodeLabel>Colonne date</NodeLabel>
        <NodeColumnSelect name="dateCol" placeholder="-- Variable Date --" value={(data.dateCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Variable à prédire</NodeLabel>
        <NodeColumnSelect name="valueCol" placeholder="-- Variable à prédire --" value={(data.valueCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Horizon de prévision</NodeLabel>
        <NodeSelect name="forecastSteps" value={(data.forecastSteps as string) || '10'} onChange={handleChange}>
          <option value="5">5 pas</option>
          <option value="10">10 pas</option>
          <option value="20">20 pas</option>
          <option value="30">30 pas</option>
          <option value="50">50 pas</option>
        </NodeSelect>
      </div>
    </NodeShell>
  );
}

export function MultivariateTimeSeriesNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#f59e0b" icon={Shuffle} title="Séries temporelles multivariées" hasInput>
      <div className="text-surface-400 text-[11px] leading-relaxed mb-2">
        VAR / VECM / BVAR, causalité de Granger, cointégration, IRF, FEVD.
      </div>
      <div>
        <NodeLabel>Colonne date</NodeLabel>
        <NodeColumnSelect name="dateCol" placeholder="-- Variable Date --" value={(data.dateCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Variables (séparées par virgule)</NodeLabel>
        <NodeMultiColumnInput name="valueCols" placeholder="ex: GDP, Inflation, Rate" value={(data.valueCols as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Variable cible (optionnel)</NodeLabel>
        <NodeColumnSelect name="targetCol" placeholder="-- Variable cible (optionnel) --" value={(data.targetCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Modèle</NodeLabel>
        <NodeSelect name="forcedModel" value={(data.forcedModel as string) || 'auto'} onChange={handleChange}>
          <option value="auto">Auto (meilleur)</option>
          <option value="var">VAR</option>
          <option value="vecm">VECM (cointégration)</option>
          <option value="bvar">BVAR (bayésien)</option>
        </NodeSelect>
      </div>
      <div>
        <NodeLabel>Horizon de prévision</NodeLabel>
        <NodeSelect name="forecastSteps" value={(data.forecastSteps as string) || '10'} onChange={handleChange}>
          <option value="5">5 pas</option>
          <option value="10">10 pas</option>
          <option value="20">20 pas</option>
          <option value="30">30 pas</option>
        </NodeSelect>
      </div>
      <div>
        <NodeLabel>Max lag (Granger)</NodeLabel>
        <NodeSelect name="grangerMaxLag" value={(data.grangerMaxLag as string) || '4'} onChange={handleChange}>
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
        </NodeSelect>
      </div>
    </NodeShell>
  );
}

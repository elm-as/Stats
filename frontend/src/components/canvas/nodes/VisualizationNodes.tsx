import { NodeProps, Node } from '@xyflow/react';
import { FileBarChart } from 'lucide-react';
import { CanvasNodeData, NodeShell, NodeLabel, NodeSelect, NodeInput, useNodeUpdate } from './_shared';

export function VisualizationNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  return (
    <NodeShell id={id} data={data} color="#14b8a6" icon={FileBarChart} title="Visualisation" hasInput>
      <div>
        <NodeLabel>Type de graphique</NodeLabel>
        <NodeSelect name="chartType" value={(data.chartType as string) || 'auto'} onChange={handleChange}>
          <option value="auto">Auto (selon les données)</option>
          <option value="scatter">Nuage de points</option>
          <option value="bar">Diagramme à barres</option>
          <option value="line">Courbe d'évolution</option>
          <option value="pie">Camembert</option>
          <option value="boxplot">Boîte à moustaches</option>
          <option value="histogram">Histogramme</option>
          <option value="heatmap">Heatmap</option>
        </NodeSelect>
      </div>
      <div>
        <NodeLabel>Axe X</NodeLabel>
        <NodeInput name="xCol" placeholder="ex: Date, Pclass" value={(data.xCol as string) || ''} onChange={handleChange} />
      </div>
      <div>
        <NodeLabel>Axe Y</NodeLabel>
        <NodeInput name="yCol" placeholder="ex: Fare" value={(data.yCol as string) || ''} onChange={handleChange} />
      </div>
    </NodeShell>
  );
}

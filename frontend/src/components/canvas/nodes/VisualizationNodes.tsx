import { NodeProps, Node } from '@xyflow/react';
import { FileBarChart } from 'lucide-react';
import { 
  CanvasNodeData, NodeShell, NodeLabel, NodeSelect,
  useNodeUpdate, useConnectedColumns, NodeColumnSelect, NodeMultiColumnInput 
} from './_shared';

const CHART_TYPES = [
  { value: 'auto', label: 'Auto (selon les donnees)' },
  { value: 'scatter', label: 'Nuage de points' },
  { value: 'bar', label: 'Diagramme a barres' },
  { value: 'line', label: 'Courbe d\'evolution' },
  { value: 'multi_line', label: 'Courbes multiples (series combinees)' },
  { value: 'pie', label: 'Camembert' },
  { value: 'boxplot', label: 'Boite a moustaches' },
  { value: 'histogram', label: 'Histogramme' },
  { value: 'heatmap', label: 'Heatmap' },
  { value: 'stacked_bar', label: 'Barres empilees' },
] as const;

export function VisualizationNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  const chartType = (data.chartType as string) || 'auto';

  const needsMultiY = chartType === 'multi_line' || chartType === 'stacked_bar';
  const needsSingleY = chartType === 'scatter' || chartType === 'bar' || chartType === 'line' || chartType === 'boxplot' || chartType === 'histogram';
  const needsNoAxes = chartType === 'pie' || chartType === 'heatmap' || chartType === 'auto';

  return (
    <NodeShell id={id} data={data} color="#14b8a6" icon={FileBarChart} title="Visualisation" hasInput>
      <div>
        <NodeLabel>Type de graphique</NodeLabel>
        <NodeSelect name="chartType" value={chartType} onChange={handleChange}>
          {CHART_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>{ct.label}</option>
          ))}
        </NodeSelect>
      </div>

      {needsMultiY && (
        <div>
          <NodeLabel>Variables Y (series superposees)</NodeLabel>
          <NodeMultiColumnInput
            name="yCols"
            placeholder="Selectionner les colonnes..."
            value={(data.yCols as string) || ''}
            onChange={handleChange}
            columns={columns}
          />
        </div>
      )}

      {needsSingleY && (
        <div>
          <NodeLabel>Axe Y</NodeLabel>
          <NodeColumnSelect
            name="yCol"
            placeholder="-- Variable Y --"
            value={(data.yCol as string) || ''}
            onChange={handleChange}
            columns={columns}
          />
        </div>
      )}

      {(needsSingleY || needsMultiY) && (
        <div>
          <NodeLabel>Axe X</NodeLabel>
          <NodeColumnSelect
            name="xCol"
            placeholder="-- Variable X (optionnel) --"
            value={(data.xCol as string) || ''}
            onChange={handleChange}
            columns={columns}
          />
        </div>
      )}

      <div>
        <NodeLabel>Grouper par (optionnel)</NodeLabel>
        <NodeColumnSelect
          name="groupCol"
          placeholder="-- Variable de groupement --"
          value={(data.groupCol as string) || ''}
          onChange={handleChange}
          columns={columns}
        />
      </div>

      {(chartType === 'bar' || chartType === 'pie') && (
        <div>
          <NodeLabel>Limite (Top N)</NodeLabel>
          <NodeSelect name="topN" value={(data.topN as string) || '20'} onChange={handleChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="0">Tout</option>
          </NodeSelect>
        </div>
      )}

      <div>
        <NodeLabel>Agregation</NodeLabel>
        <NodeSelect name="aggregation" value={(data.aggregation as string) || 'none'} onChange={handleChange}>
          <option value="none">Aucune (donnees brutes)</option>
          <option value="mean">Moyenne</option>
          <option value="sum">Somme</option>
          <option value="count">Comptage</option>
          <option value="median">Mediane</option>
        </NodeSelect>
      </div>
    </NodeShell>
  );
}

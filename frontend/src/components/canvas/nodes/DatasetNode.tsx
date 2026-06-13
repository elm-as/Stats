import { NodeProps, Node } from '@xyflow/react';
import { Database } from 'lucide-react';
import { useListDatasetsQuery } from '../../../store/api';
import { CanvasNodeData, NodeShell, NodeLabel, NodeSelect, NodeInput, useNodeUpdate } from './_shared';

export function DatasetNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { data: datasets } = useListDatasetsQuery();

  return (
    <NodeShell id={id} data={data} color="#10b981" icon={Database} title="Source de données" hasInput={false}>
      <div>
        <NodeLabel>Mode d'import</NodeLabel>
        <NodeSelect name="importMode" value={(data.importMode as string) || 'existing'} onChange={handleChange}>
          <option value="existing">Dataset existant (OpenStats)</option>
          <option value="csv">Fichier CSV/Parquet</option>
          <option value="url">URL distante</option>
          <option value="sql">Base de données SQL</option>
        </NodeSelect>
      </div>
      {(data.importMode === 'existing' || !data.importMode) ? (
        <div>
          <NodeLabel>Sélection</NodeLabel>
          <NodeSelect name="file" value={(data.file as string) || ''} onChange={handleChange}>
            <option value="">-- Choisir un dataset --</option>
            {datasets?.map((ds: any) => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </NodeSelect>
        </div>
      ) : (
        <div>
          <NodeLabel>Chemin / URL</NodeLabel>
          <NodeInput name="file" placeholder="Saisir la source..." value={(data.file as string) || ''} onChange={handleChange} />
        </div>
      )}
    </NodeShell>
  );
}

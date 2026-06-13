import { NodeProps, Node } from '@xyflow/react';
import { TrendingUp, Target } from 'lucide-react';
import { 
  CanvasNodeData, NodeShell, NodeLabel, NodeSelect, 
  useNodeUpdate, useConnectedColumns, NodeColumnSelect 
} from './_shared';

export function RegressionNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#8b5cf6" icon={TrendingUp} title="Régression" hasInput badge="ML">
      <div>
        <NodeLabel>Cible (variable numérique)</NodeLabel>
        <NodeColumnSelect name="targetCol" placeholder="-- Variable Cible --" value={(data.targetCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Algorithmes</NodeLabel>
        <NodeSelect name="models" value={(data.models as string) || 'auto'} onChange={handleChange}>
          <option value="auto">Compétitif (tous)</option>
          <option value="linear_regression">Régression Linéaire</option>
          <option value="ridge">Ridge</option>
          <option value="lasso">Lasso</option>
          <option value="elasticnet">ElasticNet</option>
          <option value="rf_regression">Random Forest</option>
          <option value="gb_regression">Gradient Boosting</option>
          <option value="xgb_regression">XGBoost</option>
          <option value="svr">SVR</option>
          <option value="knn_regression">KNN</option>
        </NodeSelect>
      </div>
    </NodeShell>
  );
}

export function ClassificationNode({ id, data }: NodeProps<Node<CanvasNodeData>>) {
  const handleChange = useNodeUpdate(id, data);
  const { columns } = useConnectedColumns(id);
  
  return (
    <NodeShell id={id} data={data} color="#8b5cf6" icon={Target} title="Classification" hasInput badge="ML">
      <div>
        <NodeLabel>Cible (variable catégorielle)</NodeLabel>
        <NodeColumnSelect name="targetCol" placeholder="-- Variable Cible --" value={(data.targetCol as string) || ''} onChange={handleChange} columns={columns} />
      </div>
      <div>
        <NodeLabel>Algorithmes</NodeLabel>
        <NodeSelect name="models" value={(data.models as string) || 'auto'} onChange={handleChange}>
          <option value="auto">Compétitif (tous)</option>
          <option value="logistic_regression">Régression Logistique</option>
          <option value="rf_classification">Random Forest</option>
          <option value="gb_classification">Gradient Boosting</option>
          <option value="xgb_classification">XGBoost</option>
          <option value="svm">SVM</option>
          <option value="knn">KNN</option>
          <option value="lda">LDA</option>
          <option value="adaboost">AdaBoost</option>
        </NodeSelect>
      </div>
    </NodeShell>
  );
}

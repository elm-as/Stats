"""
Registre et dispatcher d'exécution des nœuds Canvas.
"""

import traceback
from .source import execute_dataset
from .preparation import execute_typing, execute_cleaning, execute_transform, execute_compute_variable
from .descriptive import execute_descriptive_numeric, execute_descriptive_categorical, execute_correlation, execute_vif
from .tests import execute_test_compare_means, execute_test_correlation, execute_test_independence, execute_test_stationarity
from .factorielle import execute_pca, execute_ca, execute_mca
from .modeling import execute_clustering, execute_regression, execute_classification
from .timeseries import execute_timeseries, execute_multivariate_timeseries
from .simulation import execute_simulation
from .visualization import execute_visualization
from .output import execute_ai, execute_extension, execute_insights, execute_output

# Mapping de type de nœud vers la fonction d'exécution
NODE_EXECUTORS = {
    "dataset": execute_dataset,
    "typing": execute_typing,
    "cleaning": execute_cleaning,
    "transform": execute_transform,
    "computeVariable": execute_compute_variable,
    "descriptiveNumeric": execute_descriptive_numeric,
    "descriptiveCategorical": execute_descriptive_categorical,
    "correlation": execute_correlation,
    "vif": execute_vif,
    "testCompareMeans": execute_test_compare_means,
    "testCorrelation": execute_test_correlation,
    "testIndependence": execute_test_independence,
    "testStationarity": execute_test_stationarity,
    "pca": execute_pca,
    "ca": execute_ca,
    "mca": execute_mca,
    "clustering": execute_clustering,
    "regression": execute_regression,
    "classification": execute_classification,
    "timeseries": execute_timeseries,
    "multivariateTimeseries": execute_multivariate_timeseries,
    "simulation": execute_simulation,
    "visualization": execute_visualization,
    "ai": execute_ai,
    "extension": execute_extension,
    "insights": execute_insights,
    "output": execute_output,
}

def execute_node(node_type, data, dataset_id):
    """
    Exécute un nœud Canvas et renvoie { status, result?, error?, message? }.
    `dataset_id` est l'ID du dataset résolu depuis le nœud source.
    """
    if not dataset_id and node_type != "dataset":
        return {"status": "skipped", "message": "Aucun dataset connecté"}

    if node_type not in NODE_EXECUTORS:
        return {"status": "skipped", "message": f"Type de nœud '{node_type}' non supporté"}

    try:
        executor = NODE_EXECUTORS[node_type]
        return executor(data, dataset_id)
    except Exception as e:
        return {"status": "error", "error": str(e), "traceback": traceback.format_exc()}

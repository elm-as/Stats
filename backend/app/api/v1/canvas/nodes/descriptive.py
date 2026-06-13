"""
Nœuds descriptifs — Statistiques et Corrélations.
"""

from app.services.dataset_service import dataset_manager
from ._shared import _sanitize

def execute_descriptive_numeric(data, dataset_id):
    from app.core.analysis import compute_descriptive_stats
    df = dataset_manager.get_df(dataset_id)
    result = compute_descriptive_stats(df)
    ds = dataset_manager.get(dataset_id)
    if ds:
        ar = ds.setdefault("analysis_results", {})
        ar["descriptive_stats"] = result
    return {
        "status": "success",
        "message": "Statistiques descriptives numériques calculées",
        "result": _sanitize(result),
    }


def execute_descriptive_categorical(data, dataset_id):
    from app.core.analysis import compute_descriptive_stats
    df = dataset_manager.get_df(dataset_id)
    result = compute_descriptive_stats(df)
    return {
        "status": "success",
        "message": "Statistiques descriptives catégorielles calculées",
        "result": _sanitize(result),
    }


def execute_correlation(data, dataset_id):
    method = data.get("method", "pearson")
    from app.core.analysis import compute_correlation_matrix
    df = dataset_manager.get_df(dataset_id)
    result = compute_correlation_matrix(df, method=method)
    ds = dataset_manager.get(dataset_id)
    if ds:
        ar = ds.setdefault("analysis_results", {})
        ar["correlations"] = result
    return {
        "status": "success",
        "message": f"Matrice de corrélation ({method}) calculée",
        "result": _sanitize(result),
    }


def execute_vif(data, dataset_id):
    results = dataset_manager.analyze(dataset_id)
    vif_data = results.get("vif", {})
    ds = dataset_manager.get(dataset_id)
    if ds:
        ar = ds.setdefault("analysis_results", {})
        ar["vif"] = vif_data
    return {
        "status": "success",
        "message": "VIF (multicolinéarité) calculé",
        "result": _sanitize(vif_data),
    }

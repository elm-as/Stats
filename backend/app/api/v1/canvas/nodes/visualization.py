"""
Nœud de visualisation.
"""

from app.services.dataset_service import dataset_manager
from ._shared import _sanitize

def execute_visualization(data, dataset_id):
    chart_type = data.get("chartType", "auto")
    x_col = data.get("xCol", "")
    y_col = data.get("yCol", "")

    df = dataset_manager.get_df(dataset_id)
    if chart_type == "auto":
        numeric_cols = df.select_dtypes("number").columns.tolist()
        cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        if len(numeric_cols) >= 2:
            chart_type = "scatter"
            x_col = x_col or numeric_cols[0]
            y_col = y_col or numeric_cols[1]
        elif cat_cols and numeric_cols:
            chart_type = "bar"
            x_col = x_col or cat_cols[0]
            y_col = y_col or numeric_cols[0]
        elif cat_cols:
            chart_type = "pie"
            x_col = x_col or cat_cols[0]

    result = {"chart_type": chart_type, "x_col": x_col, "y_col": y_col, "message": "Configuré pour la visualisation"}
    return {
        "status": "success",
        "message": f"Graphique '{chart_type}' configuré",
        "result": _sanitize(result),
    }

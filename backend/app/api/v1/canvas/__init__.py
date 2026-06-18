"""
Routes API pour l'exécution de pipeline Canvas (ReactFlow).

Reçoit le graphe (nœuds + arêtes), effectue un tri topologique,
puis exécute chaque nœud en séquence en appelant les services existants.
"""

from flask import request, jsonify
from app.api.v1 import api_v1_bp
from .nodes import execute_node
from .nodes._shared import _sanitize
import os
import json
import uuid


def _topo_sort(nodes, edges):
    """Tri topologique des nœuds selon les arêtes."""
    from collections import deque, defaultdict

    adj = defaultdict(list)
    in_deg = {n["id"]: 0 for n in nodes}

    for e in edges:
        src, tgt = e["source"], e["target"]
        if src in in_deg and tgt in in_deg:
            adj[src].append(tgt)
            in_deg[tgt] += 1

    queue = deque([nid for nid, d in in_deg.items() if d == 0])
    order = []
    while queue:
        nid = queue.popleft()
        order.append(nid)
        for child in adj[nid]:
            in_deg[child] -= 1
            if in_deg[child] == 0:
                queue.append(child)

    # Si des nœuds n'ont pas été atteints (cycle), les ajouter à la fin
    remaining = [n["id"] for n in nodes if n["id"] not in order]
    order.extend(remaining)
    return order


@api_v1_bp.route("/canvas/run_pipeline", methods=["POST"])
def run_canvas_pipeline():
    """
    Exécute un pipeline Canvas complet.
    Body JSON :
    {
        "nodes": [{"id": "...", "type": "...", "data": {...}}, ...],
        "edges": [{"source": "...", "target": "..."}, ...]
    }
    """
    body = request.get_json()
    if not body:
        return jsonify({"success": False, "error": "Body JSON requis"}), 400

    nodes = body.get("nodes", [])
    edges = body.get("edges", [])

    if not nodes:
        return jsonify({"success": False, "error": "Aucun nœud dans le pipeline"}), 400

    # Index nodes by ID
    node_map = {n["id"]: n for n in nodes}

    # Topological sort
    order = _topo_sort(nodes, edges)

    # Find parent edges
    parents = {}
    for e in edges:
        parents.setdefault(e["target"], []).append(e["source"])

    # Execute nodes in order
    results = {}
    dataset_id_map = {}  # node_id -> dataset_id

    for node_id in order:
        node = node_map.get(node_id)
        if not node:
            continue

        node_type = node.get("type", "")
        node_data = node.get("data", {})

        # Remove callback functions from data
        clean_data = {k: v for k, v in node_data.items() if k not in ("onChange", "onDelete")}

        # Resolve dataset_id from parents or from self
        dataset_id = None
        if node_type == "dataset":
            # Will be resolved inside execute_node
            pass
        else:
            # Walk parent chain to find the dataset_id
            parent_ids = parents.get(node_id, [])
            for pid in parent_ids:
                if pid in dataset_id_map:
                    dataset_id = dataset_id_map[pid]
                    break

        result = execute_node(node_type, clean_data, dataset_id)
        results[node_id] = result

        # Propagate dataset_id downstream
        if node_type == "dataset" and result.get("status") == "success":
            dataset_id_map[node_id] = result.get("dataset_id")
        elif dataset_id:
            dataset_id_map[node_id] = dataset_id

    return jsonify({
        "success": True,
        "node_count": len(nodes),
        "executed": len(results),
        "results": _sanitize(results),
    })

@api_v1_bp.route("/canvas/share", methods=["POST"])
def share_canvas():
    """Crée un lien public en lecture seule pour un canvas."""
    body = request.get_json()
    if not body:
        return jsonify({"error": "Body requis"}), 400
        
    share_id = str(uuid.uuid4())
    share_dir = os.path.join(os.getcwd(), "data", "shares")
    os.makedirs(share_dir, exist_ok=True)
    
    file_path = os.path.join(share_dir, f"{share_id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(body, f)
        
    return jsonify({"success": True, "share_id": share_id, "url": f"/share/{share_id}"})

@api_v1_bp.route("/canvas/share/<share_id>", methods=["GET"])
def get_shared_canvas(share_id):
    """Récupère un canvas partagé."""
    if not share_id.replace("-", "").isalnum():
        return jsonify({"error": "Invalid share ID"}), 400
        
    share_dir = os.path.join(os.getcwd(), "data", "shares")
    file_path = os.path.join(share_dir, f"{share_id}.json")
    if not os.path.exists(file_path):
        return jsonify({"error": "Lien introuvable ou expiré"}), 404
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    return jsonify({"success": True, "data": data})

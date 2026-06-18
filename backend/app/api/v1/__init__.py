from flask import Blueprint

api_v1_bp = Blueprint("api_v1", __name__)

# Import des routes (le simple import enregistre les endpoints sur le Blueprint).
# En mode open-source, l'auth est désactivée par défaut.
import os

AUTH_ENABLED = os.getenv("AUTH_ENABLED", "false").lower() == "true"

from app.api.v1 import ingestion, cleaning, analysis, modeling, reports, jobs, extensions, canvas, marketplace  # noqa: E402, F401

if AUTH_ENABLED:
    from app.api.v1 import auth  # noqa: E402, F401
    from app.api.v1 import workspaces  # noqa: E402, F401

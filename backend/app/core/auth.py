"""Authentication domain logic: password hashing, JWTs and route guards."""

from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt as pyjwt
from flask import current_app, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from app.models.user import User


def hash_password(password: str) -> str:
    return generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)


def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)


def create_access_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "exp": now + timedelta(minutes=60),
        "iat": now,
    }
    return pyjwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def create_refresh_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": now + timedelta(days=7),
        "iat": now,
    }
    return pyjwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    return pyjwt.decode(
        token,
        current_app.config["SECRET_KEY"],
        algorithms=["HS256"],
    )


def _get_dev_user():
    """Mode open-source : utilisateur par navigateur (X-Client-Id).
    
    Chaque navigateur reçoit un ID unique stocké en localStorage côté frontend.
    Le backend lit cet ID, crée un User correspondant, et isole les datasets
    (uploaded_by, list_datasets, delete, etc.) via cet ID.

    Fallback : si pas de X-Client-Id (ancien frontend, tests), premier User existant.
    """
    from app.extensions import db

    # ── 1) Lire le X-Client-Id envoyé par le frontend ──
    client_id = "dev-admin"  # fallback
    try:
        header_val = (request.headers.get("X-Client-Id") or "").strip().lower()
        if header_val and len(header_val) <= 8 and header_val.isalnum():
            client_id = header_val
    except Exception:
        pass

    # ── 2) Chercher ou créer l'utilisateur ──
    user = db.session.get(User, client_id)
    if user:
        return user

    # Fallback : premier User existant (tests sans X-Client-Id).
    user = db.session.query(User).first()
    if user:
        return user

    # ── 3) Création automatique ──
    from flask import current_app
    current_app.logger.info("Nouveau navigateur: création user_id=%s", client_id)
    user = User(
        id=client_id,
        email=f"local+{client_id}@openstats.local",
        display_name=f"Local {client_id}",
        role="admin",
        is_active=True,
    )
    db.session.add(user)
    db.session.commit()
    return user


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        # Mode open-source (par défaut) : pas de comptes, pas de tokens.
        # On utilise un utilisateur local unique pour garder la compatibilité
        # avec les champs (uploaded_by, audits, etc.).
        if not current_app.config.get("AUTH_ENABLED", False):
            g.current_user = _get_dev_user()
            return f(*args, **kwargs)

        # Mode auth activé (SaaS / multi-user) : token obligatoire
        if not token:
            return jsonify({"error": "Token manquant"}), 401

        try:
            payload = decode_token(token)

            if payload.get("type") != "access":
                return jsonify({"error": "Type de token invalide"}), 401

            user_id = payload.get("sub")
            if not user_id:
                return jsonify({"error": "Token invalide (pas de sujet)"}), 401

            from app.extensions import db

            user = db.session.get(User, user_id)
            if not user:
                return jsonify({"error": "Utilisateur introuvable"}), 401
            if not user.is_active:
                return jsonify({"error": "Utilisateur inactif"}), 401

            g.current_user = user
        except pyjwt.ExpiredSignatureError:
            return jsonify({"error": "Token expiré"}), 401
        except pyjwt.InvalidTokenError as e:
            return jsonify({"error": f"Token invalide: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated

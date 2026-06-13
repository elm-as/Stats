"""
Logic métier d'authentification : hashing, tokens, décorateurs.
"""

import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Optional

import jwt as pyjwt
from flask import request, jsonify, current_app, g
from werkzeug.security import generate_password_hash, check_password_hash

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


def _get_jwt_secret() -> str:
    """
    Retourne le secret JWT à utiliser pour la vérification des tokens.
    En production, SUPABASE_JWT_SECRET est obligatoire.
    """
    supabase_secret = os.getenv("SUPABASE_JWT_SECRET")
    if supabase_secret:
        return supabase_secret

    is_production = os.getenv("FLASK_ENV") == "production" or os.getenv("LOCAL_DEV_MODE", "false").lower() == "false"
    if is_production:
        raise RuntimeError(
            "SUPABASE_JWT_SECRET est obligatoire en production. "
            "Configurez cette variable d'environnement avant de démarrer l'application."
        )

    import logging
    logging.getLogger(__name__).warning(
        "SUPABASE_JWT_SECRET non configuré — utilisation de SECRET_KEY locale (dev uniquement)."
    )
    return current_app.config["SECRET_KEY"]


def decode_token(token: str) -> dict:
    secret = _get_jwt_secret()
    return pyjwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        audience="authenticated",
    )


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        # Support Local Dev Mode — UNIQUEMENT en développement local.
        is_prod = os.getenv("FLASK_ENV") == "production"
        dev_mode = os.getenv("LOCAL_DEV_MODE", "false").lower() == "true"
        if not is_prod and dev_mode:
            try:
                from app.extensions import db
                user = db.session.query(User).first()
                if not user:
                    user = User(id="dev-admin", email="admin@openstats.ai", display_name="Administrateur Dev", role="admin")
                    db.session.add(user)
                    db.session.commit()
                g.current_user = user
                return f(*args, **kwargs)
            except Exception:
                class MockUser:
                    id = "dev-admin"
                    email = "admin@openstats.ai"
                    display_name = "Administrateur Dev"
                    role = "admin"
                    is_active = True
                    def to_dict(self): return {"id": self.id, "email": self.email, "display_name": self.display_name, "role": self.role}
                g.current_user = MockUser()
                return f(*args, **kwargs)

        if not token:
            return jsonify({"error": "Token manquant"}), 401

        try:
            payload = decode_token(token)

            user_id = payload.get("sub")
            if not user_id:
                return jsonify({"error": "Token invalide (pas de sujet)"}), 401

            from app.extensions import db
            user = db.session.get(User, user_id)
            if not user:
                # Auto-provisionnement depuis Supabase : créer l'utilisateur local
                # à partir des claims du JWT (uniquement si l'email est présent).
                email = payload.get("email")
                if email:
                    user = User(id=user_id, email=email, display_name=email.split('@')[0], role="user", is_active=True)
                    db.session.add(user)
                    db.session.commit()
                else:
                    return jsonify({"error": "Utilisateur introuvable"}), 401
            elif not user.is_active:
                return jsonify({"error": "Utilisateur inactif"}), 401

            g.current_user = user
        except pyjwt.ExpiredSignatureError:
            return jsonify({"error": "Token expiré"}), 401
        except pyjwt.InvalidAudienceError:
            return jsonify({"error": "Audience du token invalide"}), 401
        except pyjwt.InvalidTokenError as e:
            return jsonify({"error": f"Token invalide: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated

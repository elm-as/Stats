"""API v1 authentication routes."""

import re

import jwt as pyjwt
from flask import g, jsonify, request

from app.api.v1 import api_v1_bp
from app.core.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    login_required,
    verify_password,
)
from app.extensions import db
from app.models.user import User

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


@api_v1_bp.route("/auth/register", methods=["POST"])
def auth_register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("display_name") or "").strip()

    errors = []
    if not email or not _EMAIL_RE.match(email):
        errors.append("Email invalide")
    if len(password) < 8:
        errors.append("Le mot de passe doit contenir au moins 8 caractères")
    if not display_name:
        errors.append("Le nom est requis")
    if errors:
        return jsonify({"error": "Validation échouée", "details": errors}), 400

    if db.session.query(User).filter_by(email=email).first():
        return jsonify({"error": "Cet email est déjà utilisé"}), 409

    user = User(
        email=email,
        password_hash=hash_password(password),
        display_name=display_name,
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    return jsonify({
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@api_v1_bp.route("/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    user = db.session.query(User).filter_by(email=email).first()
    if not user or not user.password_hash or not verify_password(password, user.password_hash):
        return jsonify({"error": "Identifiants invalides"}), 401

    if not user.is_active:
        return jsonify({"error": "Compte désactivé"}), 403

    user.update_last_login()
    db.session.commit()

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    return jsonify({
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    })


@api_v1_bp.route("/auth/refresh", methods=["POST"])
def auth_refresh():
    data = request.get_json(silent=True) or {}
    token = data.get("refresh_token") or ""

    if not token:
        return jsonify({"error": "Refresh token requis"}), 400

    try:
        payload = decode_token(token)
    except pyjwt.ExpiredSignatureError:
        return jsonify({"error": "Refresh token expiré"}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({"error": "Refresh token invalide"}), 401

    if payload.get("type") != "refresh":
        return jsonify({"error": "Type de token invalide"}), 401

    user = db.session.get(User, payload["sub"])
    if not user or not user.is_active:
        return jsonify({"error": "Utilisateur introuvable"}), 401

    access_token = create_access_token(user.id, user.role)

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict(),
    })


@api_v1_bp.route("/auth/me", methods=["GET"])
@login_required
def auth_me():
    return jsonify({"user": g.current_user.to_dict()})


@api_v1_bp.route("/auth/profile", methods=["PUT"])
@login_required
def update_profile():
    data = request.get_json(silent=True) or {}
    user = g.current_user

    display_name = (data.get("display_name") or "").strip()
    preferences = data.get("preferences")

    if display_name:
        user.display_name = display_name

    if isinstance(preferences, dict):
        user.preferences = preferences

    db.session.commit()
    return jsonify({"user": user.to_dict(), "message": "Profil mis à jour"})

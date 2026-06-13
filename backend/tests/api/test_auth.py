import jwt
import os
from datetime import datetime, timedelta, timezone

def create_valid_token():
    payload = {
        "sub": "test-user-id",
        "email": "test@openstats.ai",
        "role": "user",
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
    }
    return jwt.encode(payload, os.getenv("SUPABASE_JWT_SECRET", "fake-supabase-jwt-secret-for-testing-only"), algorithm="HS256")

def test_protected_route_without_token(client):
    """Vérifie qu'une route protégée rejette les accès sans token."""
    response = client.get("/api/v1/datasets")
    assert response.status_code == 401
    assert "Token manquant" in response.get_json()["error"]

def test_protected_route_with_valid_token(client, test_user):
    """Vérifie qu'un token valide autorise l'accès."""
    token = create_valid_token()
    response = client.get("/api/v1/datasets", headers={"Authorization": f"Bearer {token}"})
    # Devrait retourner 200 (liste vide)
    assert response.status_code == 200
    assert response.get_json() == []

def test_invalid_token_rejected(client):
    """Vérifie qu'un token invalide ou corrompu est rejeté."""
    response = client.get("/api/v1/datasets", headers={"Authorization": "Bearer not.a.valid.token"})
    assert response.status_code == 401
    assert "Token invalide" in response.get_json()["error"]

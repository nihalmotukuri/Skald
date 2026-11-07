from types import SimpleNamespace
from uuid import UUID

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException

from app.auth import decode_access_token
from app.config import Settings


class FakeJwksClient:
    def __init__(self, signing_key: object) -> None:
        self.signing_key = signing_key

    def get_signing_key_from_jwt(self, token: str) -> object:
        return SimpleNamespace(key=self.signing_key)


@pytest.fixture
def key_pair() -> tuple[object, object]:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return private_key, private_key.public_key()


def settings() -> Settings:
    return Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="provider-key",
        gemini_model="gemini-test",
        cors_origins=("http://localhost:5173",),
    )


def test_access_token_requires_valid_signature_and_claims(key_pair: tuple[object, object]) -> None:
    private_key, public_key = key_pair
    user_id = UUID("3f3c9f96-90f7-4a80-8b62-6cb2f3c8b582")
    token = jwt.encode(
        {
            "sub": str(user_id),
            "aud": "authenticated",
            "iss": "https://example.supabase.co/auth/v1",
            "exp": 2_000_000_000,
        },
        private_key,
        algorithm="RS256",
    )

    principal = decode_access_token(token, settings(), FakeJwksClient(public_key))
    assert principal.user_id == user_id
    assert principal.access_token == token

    with pytest.raises(HTTPException) as error:
        decode_access_token(f"{token}tampered", settings(), FakeJwksClient(public_key))
    assert error.value.status_code == 401


def test_access_token_rejects_wrong_issuer(key_pair: tuple[object, object]) -> None:
    private_key, public_key = key_pair
    token = jwt.encode(
        {
            "sub": "3f3c9f96-90f7-4a80-8b62-6cb2f3c8b582",
            "aud": "authenticated",
            "iss": "https://attacker.example/auth/v1",
            "exp": 2_000_000_000,
        },
        private_key,
        algorithm="RS256",
    )

    with pytest.raises(HTTPException) as error:
        decode_access_token(token, settings(), FakeJwksClient(public_key))
    assert error.value.status_code == 401

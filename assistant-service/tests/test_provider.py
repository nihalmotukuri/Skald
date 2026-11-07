import asyncio
from typing import Any

import httpx
import pytest

from app import provider
from app.config import Settings
from app.models import ChatMessage


class FakeResponse:
    status_code = 200
    is_error = False

    def json(self) -> dict[str, Any]:
        return {"candidates": [{"content": {"parts": [{"text": "A focused plan."}]}}]}


class FakeAsyncClient:
    request: dict[str, Any] = {}

    def __init__(self, timeout: int) -> None:
        self.timeout = timeout

    async def __aenter__(self) -> "FakeAsyncClient":
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def post(self, url: str, headers: dict[str, str], json: dict[str, Any]) -> FakeResponse:
        FakeAsyncClient.request = {"url": url, "headers": headers, "json": json}
        return FakeResponse()


def test_provider_keeps_key_server_side_and_encodes_chat_history(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="server-only-key",
        gemini_model="gemini-test",
        cors_origins=("http://localhost:5173",),
    )

    reply = asyncio.run(provider.generate_reply(
        [
            ChatMessage(role="user", content="Plan my day."),
            ChatMessage(role="assistant", content="What is most important?"),
            ChatMessage(role="user", content="Finish the launch plan."),
        ],
        {"tasks": [{"title": "Launch plan"}], "notes": []},
        settings,
    ))

    assert reply == "A focused plan."
    assert FakeAsyncClient.request["headers"] == {"x-goog-api-key": "server-only-key"}
    assert "server-only-key" not in FakeAsyncClient.request["url"]
    assert [turn["role"] for turn in FakeAsyncClient.request["json"]["contents"]] == [
        "user",
        "model",
        "user",
    ]
    assert "Launch plan" in FakeAsyncClient.request["json"]["systemInstruction"]["parts"][0]["text"]

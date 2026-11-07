import asyncio
from typing import Any
from uuid import UUID

import httpx
import pytest

from app import context
from app.config import Settings

USER_ID = UUID("3f3c9f96-90f7-4a80-8b62-6cb2f3c8b582")


class FakeResponse:
    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.rows = rows

    def raise_for_status(self) -> None:
        return None

    def json(self) -> list[dict[str, Any]]:
        return self.rows


class FakeAsyncClient:
    calls: list[dict[str, Any]] = []

    def __init__(self, timeout: int) -> None:
        self.timeout = timeout

    async def __aenter__(self) -> "FakeAsyncClient":
        FakeAsyncClient.calls = []
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def get(
        self,
        url: str,
        params: dict[str, str],
        headers: dict[str, str],
    ) -> FakeResponse:
        FakeAsyncClient.calls.append({"url": url, "params": params, "headers": headers})
        if url.endswith("/tasks"):
            return FakeResponse([{
                "id": "task-1",
                "title": "Plan launch",
                "description": "Review the release",
                "task_list_id": "list-1",
                "status": "pending",
                "priority": "high",
                "due_at": None,
            }])
        if url.endswith("/task_lists"):
            return FakeResponse([{"id": "list-1", "name": "Work"}])
        return FakeResponse([{"id": "note-1", "title": "Idea", "body": "A note", "created_at": "2026-11-07T00:00:00Z"}])


def test_context_queries_are_bound_to_verified_user(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="provider-key",
        gemini_model="gemini-test",
        cors_origins=("http://localhost:5173",),
    )

    result = asyncio.run(context.load_user_context(USER_ID, "verified-access-token", settings))

    assert result["tasks"][0]["task_list"] == "Work"
    assert result["tasks"][0]["id"] == "task-1"
    assert result["notes"][0]["title"] == "Idea"
    assert result["notes"][0]["id"] == "note-1"
    assert result["task_lists"][0]["id"] == "list-1"
    assert len(FakeAsyncClient.calls) == 3
    for call in FakeAsyncClient.calls:
        assert call["params"]["user_id"] == f"eq.{USER_ID}"
        assert call["headers"]["Authorization"] == "Bearer verified-access-token"
        assert call["headers"]["apikey"] == "publishable-key"

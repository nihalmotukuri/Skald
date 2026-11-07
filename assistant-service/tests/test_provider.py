import asyncio
import json
from typing import Any
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException

from app import provider
from app.config import Settings
from app.models import ChatMessage


class FakeResponse:
    status_code = 200
    is_error = False
    response_text = json.dumps({
        "reply": "A focused plan.",
        "proposals": [{
            "action": "create_task",
            "summary": "Create the release task",
            "title": "Ship the release",
            "description": "Finalize release notes",
            "priority": "high",
            "status": "pending",
            "task_list_id": None,
            "due_at": None,
        }],
    })

    def json(self) -> dict[str, Any]:
        return {"candidates": [{"content": {"parts": [{"text": self.response_text}]}}]}


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


class FakeStreamResponse:
    status_code = 200

    def __init__(self, chunks: list[str]) -> None:
        self.chunks = chunks

    async def __aenter__(self) -> "FakeStreamResponse":
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def aiter_lines(self):
        for chunk in self.chunks:
            yield f"data: {json.dumps({'candidates': [{'content': {'parts': [{'text': chunk}]}}]})}"


class FakeStreamingAsyncClient:
    request: dict[str, Any] = {}
    chunks: list[str] = []

    def __init__(self, timeout: httpx.Timeout) -> None:
        self.timeout = timeout

    async def __aenter__(self) -> "FakeStreamingAsyncClient":
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    def stream(self, method: str, url: str, **kwargs: Any) -> FakeStreamResponse:
        FakeStreamingAsyncClient.request = {"method": method, "url": url, **kwargs}
        return FakeStreamResponse(self.chunks)


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

    result = asyncio.run(provider.generate_reply(
        [
            ChatMessage(role="user", content="Plan my day."),
            ChatMessage(role="assistant", content="What is most important?"),
            ChatMessage(role="user", content="Finish the launch plan."),
        ],
        {"tasks": [{"id": "task-1", "title": "Launch plan"}], "notes": [], "task_lists": []},
        settings,
    ))

    assert result.reply == "A focused plan."
    assert result.proposals[0].action.action == "create_task"
    assert FakeAsyncClient.request["headers"] == {"x-goog-api-key": "server-only-key"}
    assert "server-only-key" not in FakeAsyncClient.request["url"]
    assert [turn["role"] for turn in FakeAsyncClient.request["json"]["contents"]] == [
        "user",
        "model",
        "user",
    ]
    assert "Launch plan" in FakeAsyncClient.request["json"]["systemInstruction"]["parts"][0]["text"]
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseMimeType"] == "application/json"


def test_provider_rejects_proposals_for_records_outside_user_context(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    task_id = uuid4()
    monkeypatch.setattr(FakeResponse, "response_text", json.dumps({
        "reply": "I can update that task.",
        "proposals": [{
            "action": "delete_task",
            "summary": "Delete a task",
            "task_id": str(uuid4()),
        }],
    }))
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="server-only-key",
        gemini_model="gemini-test",
        cors_origins=("http://localhost:5173",),
    )

    with pytest.raises(HTTPException) as error:
        asyncio.run(provider.generate_reply(
            [ChatMessage(role="user", content="Delete a task.")],
            {
                "tasks": [{"id": str(task_id), "title": "Allowed task"}],
                "notes": [],
                "task_lists": [],
            },
            settings,
        ))

    assert error.value.status_code == 502


def test_provider_streams_only_decoded_reply_then_returns_validated_proposals(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(httpx, "AsyncClient", FakeStreamingAsyncClient)
    FakeStreamingAsyncClient.chunks = [
        '{"reply":"Hello \\"',
        'there\\" \\ud83d',
        '\\ude80","proposals":[]}',
    ]
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="server-only-key",
        gemini_model="gemini-test",
        cors_origins=("http://localhost:5173",),
    )

    items = asyncio.run(_collect_stream(settings))

    assert "".join(item for item in items if isinstance(item, str)) == 'Hello "there" 🚀'
    assert items[-1].reply == 'Hello "there" 🚀'
    assert FakeStreamingAsyncClient.request["method"] == "POST"
    assert FakeStreamingAsyncClient.request["url"].endswith(":streamGenerateContent")
    assert FakeStreamingAsyncClient.request["params"] == {"alt": "sse"}
    assert FakeStreamingAsyncClient.request["headers"] == {"x-goog-api-key": "server-only-key"}
    assert FakeStreamingAsyncClient.request["json"]["generationConfig"]["responseMimeType"] == "application/json"


async def _collect_stream(settings: Settings) -> list[str | Any]:
    return [
        item async for item in provider.stream_reply(
            [ChatMessage(role="user", content="Say hello.")],
            {"tasks": [], "notes": [], "task_lists": []},
            settings,
        )
    ]


def test_reply_prefix_handles_partial_escaped_values() -> None:
    assert provider._decode_reply_prefix(r'{"reply":"line\nwith \"') == 'line\nwith "'
    assert provider._decode_reply_prefix('{"reply":"rocket \\ud83d') == 'rocket '
    assert provider._decode_reply_prefix('{"reply":"rocket \\ud83d\\ude80"}') == "rocket 🚀"

import asyncio
import base64
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
    assert FakeAsyncClient.request["url"].endswith(":generateContent")
    assert FakeAsyncClient.request["headers"] == {"x-goog-api-key": "server-only-key"}
    assert "server-only-key" not in FakeAsyncClient.request["url"]
    assert [turn["role"] for turn in FakeAsyncClient.request["json"]["contents"]] == [
        "user",
        "model",
        "user",
    ]
    assert "Launch plan" in FakeAsyncClient.request["json"]["systemInstruction"]["parts"][0]["text"]
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseMimeType"] == "application/json"
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseJsonSchema"] == provider.RESPONSE_JSON_SCHEMA
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseJsonSchema"]["properties"]["proposals"]["items"]["properties"]["action"]["enum"] == [
        "create_task",
        "update_task",
        "delete_task",
        "create_note",
        "update_note",
        "delete_note",
    ]


def test_provider_encodes_image_and_text_attachments(
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
    request = provider._request_body(
        [ChatMessage(
            role="user",
            content="Summarize these attachments.",
            attachments=[
                {"name": "photo.png", "mime_type": "image/png", "data": base64.b64encode(b"png").decode()},
                {"name": "notes.txt", "mime_type": "text/plain", "data": base64.b64encode(b"line one").decode()},
                {"name": "report.pdf", "mime_type": "application/pdf", "data": base64.b64encode(b"%PDF-").decode()},
            ],
        )],
        {"tasks": [], "notes": [], "task_lists": []},
    )

    parts = request["contents"][0]["parts"]
    assert parts[0]["text"].endswith("--- Attached file: notes.txt ---\nline one")
    assert parts[1] == {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(b"png").decode()}}
    assert parts[2] == {"inlineData": {"mimeType": "application/pdf", "data": base64.b64encode(b"%PDF-").decode()}}


def test_attachment_payload_rejects_invalid_base64_and_oversized_content() -> None:
    from app.models import ChatAttachment

    with pytest.raises(ValueError):
        ChatAttachment(name="bad.png", mime_type="image/png", data="not base64")
    with pytest.raises(ValueError):
        ChatAttachment(
            name="large.txt",
            mime_type="text/plain",
            data=base64.b64encode(b"x" * (5 * 1024 * 1024 + 1)).decode(),
        )


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


def test_provider_reports_temporary_model_overload_as_retryable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(FakeResponse, "status_code", 503)
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
            [ChatMessage(role="user", content="What should I prioritize?")],
            {"tasks": [], "notes": [], "task_lists": []},
            settings,
        ))

    assert error.value.status_code == 503
    assert "busy right now" in error.value.detail


def test_provider_stream_route_uses_supported_generation_and_returns_sse_items(
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
    items = asyncio.run(_collect_stream(settings))

    assert [item for item in items if isinstance(item, str)] == ["A focused plan."]
    assert items[-1].reply == "A focused plan."
    assert FakeAsyncClient.request["url"].endswith(":generateContent")
    assert not FakeAsyncClient.request["url"].endswith(":streamGenerateContent")
    assert FakeAsyncClient.request["headers"] == {"x-goog-api-key": "server-only-key"}
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseMimeType"] == "application/json"


async def _collect_stream(settings: Settings) -> list[str | Any]:
    return [
        item async for item in provider.stream_reply(
            [ChatMessage(role="user", content="Say hello.")],
            {"tasks": [], "notes": [], "task_lists": []},
            settings,
        )
    ]

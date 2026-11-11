import asyncio
import base64
import json
from typing import Any
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

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
        FakeAsyncClient.request = {"timeout": self.timeout, "url": url, "headers": headers, "json": json}
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
        "Asia/Kolkata",
    ))

    assert result.reply == "A focused plan."
    assert result.proposals[0].action.action == "create_task"
    assert FakeAsyncClient.request["timeout"] == provider.GEMINI_REQUEST_TIMEOUT_SECONDS
    assert FakeAsyncClient.request["url"].endswith(":generateContent")
    assert FakeAsyncClient.request["headers"] == {"x-goog-api-key": "server-only-key"}
    assert "server-only-key" not in FakeAsyncClient.request["url"]
    assert [turn["role"] for turn in FakeAsyncClient.request["json"]["contents"]] == [
        "user",
        "model",
        "user",
    ]
    system_instruction = FakeAsyncClient.request["json"]["systemInstruction"]["parts"][0]["text"]
    assert "Launch plan" in system_instruction
    assert "Current user local date/time:" in system_instruction
    assert "(Asia/Kolkata)" in system_instruction
    assert "+05:30" in system_instruction
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseMimeType"] == "application/json"
    assert FakeAsyncClient.request["json"]["generationConfig"]["responseJsonSchema"] == provider.RESPONSE_JSON_SCHEMA
    actions = FakeAsyncClient.request["json"]["generationConfig"]["responseJsonSchema"]["properties"]["proposals"]["items"]["anyOf"]
    assert [schema["properties"]["action"]["enum"][0] for schema in actions] == [
        "create_task",
        "update_task",
        "delete_task",
        "create_note",
        "update_note",
        "delete_note",
    ]
    assert actions[1]["required"] == [
        "action", "summary", "task_id", "title", "description", "due_at", "priority", "status",
        "task_list_id", "changed_fields",
    ]


def test_provider_parses_update_task_with_all_mutable_fields() -> None:
    task_id = str(uuid4())
    response = provider._parse_provider_result(json.dumps({
        "reply": "I prepared the update.",
        "proposals": [{
            "action": "update_task",
            "summary": "Update the task",
            "task_id": task_id,
            "title": "QA Chat Assistant Task",
            "description": "Updated temporary test item.",
            "due_at": None,
            "priority": "high",
            "status": "pending",
            "task_list_id": None,
            "changed_fields": [
                "title", "description", "due_at", "priority", "status", "task_list_id",
            ],
        }],
    }), {
        "tasks": [{"id": task_id}],
        "notes": [],
        "task_lists": [],
    })

    assert response.proposals[0].action.action == "update_task"
    assert response.proposals[0].action.task_id == UUID(task_id)


def test_provider_preserves_unrequested_task_fields_and_due_time() -> None:
    task_id = str(uuid4())
    response = provider._parse_provider_result(json.dumps({
        "reply": "I prepared the title update.",
        "proposals": [{
            "action": "update_task",
            "summary": "Rename the task",
            "task_id": task_id,
            "title": "New title",
            "description": "Model-generated description that was not requested.",
            "due_at": "2025-11-10T17:40:00+05:30",
            "priority": "high",
            "status": "done",
            "task_list_id": None,
            "changed_fields": ["title"],
        }],
    }), {
        "tasks": [{
            "id": task_id,
            "title": "Old title",
            "description": "Keep this description.",
            "due_at": "2025-11-10T12:10:00+05:30",
            "priority": "medium",
            "status": "pending",
            "task_list_id": None,
        }],
        "notes": [],
        "task_lists": [],
    })

    action = response.proposals[0].action
    assert action.action == "update_task"
    assert action.title == "New title"
    assert action.description == "Keep this description."
    assert action.due_at.isoformat() == "2025-11-10T12:10:00+05:30"
    assert action.priority == "medium"
    assert action.status == "pending"
    assert action.task_list_id is None


@pytest.mark.parametrize(
    "due_at",
    ["2025-11-10T12:10:00", "2025-11-10T12:10:00Z", "2025-11-10T12:10:00+05:30"],
)
def test_task_proposal_requires_an_explicit_timezone(due_at: str) -> None:
    response_text = json.dumps({
        "reply": "I prepared the task.",
        "proposals": [{
            "action": "create_task",
            "summary": "Create a task",
            "title": "Task",
            "description": "",
            "due_at": due_at,
            "priority": "medium",
            "status": "pending",
            "task_list_id": None,
        }],
    })

    if due_at.endswith("Z") or "+" in due_at:
        result = provider._parse_provider_result(response_text, {
            "tasks": [], "notes": [], "task_lists": [],
        })
        assert result.proposals[0].action.action == "create_task"
    else:
        with pytest.raises(HTTPException, match="invalid response format"):
            provider._parse_provider_result(response_text, {
                "tasks": [], "notes": [], "task_lists": [],
            })


def test_task_due_time_keeps_requested_local_wall_clock_time() -> None:
    result = provider._parse_provider_result(json.dumps({
        "reply": "I prepared the task.",
        "proposals": [{
            "action": "create_task",
            "summary": "Create a task",
            "title": "Task",
            "description": "",
            "due_at": "2025-11-10T12:10:00+05:30",
            "priority": "medium",
            "status": "pending",
            "task_list_id": None,
        }],
    }), {
        "tasks": [], "notes": [], "task_lists": [],
    })

    action = result.proposals[0].action
    assert action.action == "create_task"
    due_at = action.due_at
    assert due_at is not None
    assert due_at.astimezone(ZoneInfo("Asia/Kolkata")).strftime("%Y-%m-%d %H:%M") == "2025-11-10 12:10"
    assert due_at.astimezone(ZoneInfo("UTC")).strftime("%H:%M") == "06:40"


def test_provider_extracts_safe_error_message_from_http_response() -> None:
    response = httpx.Response(
        503,
        json={"error": {"message": "The model is temporarily overloaded."}},
    )

    assert provider._provider_error_message(response) == "The model is temporarily overloaded."


def test_provider_retries_gemini_503_with_bounded_backoff(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    attempts = 0
    delays: list[float] = []

    class UnavailableResponse:
        status_code = 503

    class RetryClient(FakeAsyncClient):
        async def post(self, url: str, headers: dict[str, str], json: dict[str, Any]) -> Any:
            nonlocal attempts
            attempts += 1
            if attempts <= provider.GEMINI_UNAVAILABLE_RETRIES:
                return UnavailableResponse()
            return FakeResponse()

    async def record_delay(delay: float) -> None:
        delays.append(delay)

    monkeypatch.setattr(httpx, "AsyncClient", RetryClient)
    monkeypatch.setattr(provider.asyncio, "sleep", record_delay)
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="server-only-key",
        gemini_model="gemini-test",
        cors_origins=("http://localhost:5173",),
    )

    result = asyncio.run(provider.generate_reply(
        [ChatMessage(role="user", content="Create a task.")],
        {"tasks": [], "notes": [], "task_lists": []},
        settings,
    ))

    assert result.reply == "A focused plan."
    assert attempts == provider.GEMINI_UNAVAILABLE_RETRIES + 1
    assert delays == [1, 2, 4, 8, 8]


def test_provider_falls_back_when_configured_model_quota_is_exhausted(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    request_urls: list[str] = []

    class QuotaResponse:
        status_code = 429

    class FallbackClient(FakeAsyncClient):
        async def post(self, url: str, headers: dict[str, str], json: dict[str, Any]) -> Any:
            request_urls.append(url)
            return QuotaResponse() if len(request_urls) == 1 else FakeResponse()

    monkeypatch.setattr(httpx, "AsyncClient", FallbackClient)
    settings = Settings(
        supabase_url="https://example.supabase.co",
        supabase_publishable_key="publishable-key",
        supabase_jwks_url="https://example.supabase.co/auth/v1/.well-known/jwks.json",
        gemini_api_key="server-only-key",
        gemini_model="gemini-3.6-flash",
        cors_origins=("http://localhost:5173",),
    )

    result = asyncio.run(provider.generate_reply(
        [ChatMessage(role="user", content="Create a task.")],
        {"tasks": [], "notes": [], "task_lists": []},
        settings,
    ))

    assert result.reply == "A focused plan."
    assert len(request_urls) == 2
    assert "gemini-3.6-flash:generateContent" in request_urls[0]
    assert f"{provider.GEMINI_FALLBACK_MODEL}:generateContent" in request_urls[1]


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
    async def skip_retry_delay(delay: float) -> None:
        return None

    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(FakeResponse, "status_code", 503)
    monkeypatch.setattr(provider.asyncio, "sleep", skip_retry_delay)
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

from collections.abc import Iterator
import json
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app import main
from app.auth import CurrentUser, get_current_user
from app.config import get_settings
from app.models import ChatMessage, ChatResult, CreateTaskProposal, ProposalEnvelope

USER_ID = UUID("3f3c9f96-90f7-4a80-8b62-6cb2f3c8b582")


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "publishable-test-key")
    monkeypatch.setenv("SUPABASE_JWKS_URL", "https://example.supabase.co/auth/v1/.well-known/jwks.json")
    monkeypatch.setenv("GEMINI_API_KEY", "test-provider-key")
    get_settings.cache_clear()
    main.app.dependency_overrides[get_current_user] = lambda: CurrentUser(
        user_id=USER_ID,
        access_token="signed-user-token",
    )
    with TestClient(main.app) as test_client:
        yield test_client
    main.app.dependency_overrides.clear()
    get_settings.cache_clear()


def test_chat_uses_authenticated_user_context(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: dict[str, object] = {}

    async def fake_context(user_id: UUID, access_token: str, settings: object) -> dict[str, list[dict[str, str]]]:
        calls["user_id"] = user_id
        calls["access_token"] = access_token
        return {"tasks": [], "notes": []}

    async def fake_reply(
        messages: list[ChatMessage],
        context: dict[str, list[dict[str, str]]],
        settings: object,
        timezone: str,
    ) -> ChatResult:
        calls["messages"] = messages
        calls["context"] = context
        calls["timezone"] = timezone
        return ChatResult(
            reply="Let's plan your day.",
            proposals=[ProposalEnvelope(action=CreateTaskProposal(
                action="create_task",
                summary="Add a planning task",
                title="Plan the day",
            ))],
        )

    monkeypatch.setattr(main, "load_user_context", fake_context)
    monkeypatch.setattr(main, "generate_reply", fake_reply)

    response = client.post(
        "/api/chat",
        json={
            "messages": [{"role": "user", "content": "Help me plan my day."}],
            "timezone": "Asia/Kolkata",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["reply"] == "Let's plan your day."
    assert payload["proposals"][0]["action"]["action"] == "create_task"
    assert payload["proposals"][0]["action"]["title"] == "Plan the day"
    assert calls["user_id"] == USER_ID
    assert calls["access_token"] == "signed-user-token"
    assert calls["timezone"] == "Asia/Kolkata"


def test_stream_endpoint_emits_deltas_and_final_proposals(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_context(user_id: UUID, access_token: str, settings: object) -> dict[str, list[dict[str, str]]]:
        return {"tasks": [], "notes": [], "task_lists": []}

    async def fake_stream(messages: list[ChatMessage], context: object, settings: object, timezone: str):
        assert timezone == "UTC"
        yield "A streamed "
        yield "reply."
        yield ChatResult(
            reply="A streamed reply.",
            proposals=[ProposalEnvelope(action=CreateTaskProposal(
                action="create_task",
                summary="Create a task",
                title="Stream test",
            ))],
        )

    monkeypatch.setattr(main, "load_user_context", fake_context)
    monkeypatch.setattr(main, "stream_reply", fake_stream)

    response = client.post(
        "/api/chat/stream",
        json={"messages": [{"role": "user", "content": "Help me."}]},
    )

    events = [
        json.loads(line[6:])
        for line in response.text.splitlines()
        if line.startswith("data: ")
    ]
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert [event["text"] for event in events if event["type"] == "delta"] == ["A streamed ", "reply."]
    assert events[-1]["type"] == "complete"
    assert events[-1]["reply"] == "A streamed reply."
    assert events[-1]["proposals"][0]["action"]["title"] == "Stream test"


def test_stream_endpoint_reports_unexpected_errors_safely(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    async def fake_context(user_id: UUID, access_token: str, settings: object) -> dict[str, list[dict[str, str]]]:
        return {"tasks": [], "notes": [], "task_lists": []}

    async def fake_stream(messages: list[ChatMessage], context: object, settings: object, timezone: str):
        raise RuntimeError("internal provider details")
        yield "unreachable"

    monkeypatch.setattr(main, "load_user_context", fake_context)
    monkeypatch.setattr(main, "stream_reply", fake_stream)

    with caplog.at_level("ERROR"):
        response = client.post(
            "/api/chat/stream",
            json={"messages": [{"role": "user", "content": "Help me."}]},
        )

    event = next(
        json.loads(line[6:])
        for line in response.text.splitlines()
        if line.startswith("data: ")
    )
    assert event == {"type": "error", "detail": "Mr Groff could not complete that response."}
    assert "Unexpected error while streaming Mr Groff response" in caplog.text
    assert "internal provider details" in caplog.text


def test_health_check_does_not_require_provider_configuration() -> None:
    with TestClient(main.app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_requires_authentication() -> None:
    with TestClient(main.app) as client:
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Hello"}]},
        )

    assert response.status_code == 401


def test_stream_chat_requires_authentication() -> None:
    with TestClient(main.app) as client:
        response = client.post(
            "/api/chat/stream",
            json={"messages": [{"role": "user", "content": "Hello"}]},
        )

    assert response.status_code == 401


@pytest.mark.parametrize(
    "messages",
    [
        [],
        [{"role": "user", "content": "   "}],
        [{"role": "assistant", "content": "A reply without a user prompt"}],
        [{"role": "user", "content": "x" * 4000}] * 6,
    ],
)
def test_chat_rejects_invalid_conversation(
    client: TestClient,
    messages: list[dict[str, str]],
) -> None:
    response = client.post("/api/chat", json={"messages": messages})
    assert response.status_code == 422


def test_chat_rejects_invalid_timezone(client: TestClient) -> None:
    response = client.post(
        "/api/chat/stream",
        json={
            "messages": [{"role": "user", "content": "Create a task at 12:10 PM."}],
            "timezone": "Mars/Olympus",
        },
    )

    assert response.status_code == 422

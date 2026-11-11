import asyncio
from typing import Any
from uuid import UUID

import httpx
from fastapi import HTTPException

from app.config import Settings


async def _get_rows(
    client: httpx.AsyncClient,
    settings: Settings,
    access_token: str,
    table: str,
    params: dict[str, str],
) -> list[dict[str, Any]]:
    try:
        response = await client.get(
            f"{settings.supabase_url}/rest/v1/{table}",
            params=params,
            headers={
                "apikey": settings.supabase_publishable_key,
                "Authorization": f"Bearer {access_token}",
            },
        )
        response.raise_for_status()
        rows = response.json()
    except httpx.TimeoutException as error:
        raise HTTPException(status_code=504, detail="Timed out loading assistant context.") from error
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=502, detail="Unable to load assistant context.") from error
    except httpx.RequestError as error:
        raise HTTPException(status_code=503, detail="Unable to reach the data service.") from error
    except ValueError as error:
        raise HTTPException(status_code=502, detail="The data service returned an invalid response.") from error

    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        raise HTTPException(status_code=502, detail="The data service returned an invalid response.")
    return rows


def _text(value: object, limit: int) -> str:
    return value[:limit] if isinstance(value, str) else ""


async def load_user_context(
    user_id: UUID,
    access_token: str,
    settings: Settings,
) -> dict[str, list[dict[str, str]]]:
    user_filter = f"eq.{user_id}"
    async with httpx.AsyncClient(timeout=10) as client:
        tasks, notes, task_lists = await asyncio.gather(
            _get_rows(
                client,
                settings,
                access_token,
                "tasks",
                {
                    "select": "id,title,description,due_at,priority,status,completed_at,task_list_id",
                    "user_id": user_filter,
                    "order": "created_at.desc",
                    "limit": "30",
                },
            ),
            _get_rows(
                client,
                settings,
                access_token,
                "notes",
                {
                    "select": "id,title,body,created_at",
                    "user_id": user_filter,
                    "order": "created_at.desc",
                    "limit": "20",
                },
            ),
            _get_rows(
                client,
                settings,
                access_token,
                "task_lists",
                {
                    "select": "id,name",
                    "user_id": user_filter,
                    "order": "created_at",
                    "limit": "80",
                },
            ),
        )

    list_names = {
        row["id"]: _text(row.get("name"), 80)
        for row in task_lists
        if isinstance(row.get("id"), str)
    }
    return {
        "tasks": [
            {
                "title": _text(task.get("title"), 300),
                "id": _text(task.get("id"), 36),
                "description": _text(task.get("description"), 700),
                "due_at": _text(task.get("due_at"), 40),
                "priority": _text(task.get("priority"), 20),
                "status": _text(task.get("status"), 20),
                "task_list_id": _text(task.get("task_list_id"), 36),
                "task_list": list_names.get(task.get("task_list_id"), ""),
            }
            for task in tasks
        ],
        "notes": [
            {
                "title": _text(note.get("title"), 300),
                "id": _text(note.get("id"), 36),
                "body": _text(note.get("body"), 1200),
                "created_at": _text(note.get("created_at"), 40),
            }
            for note in notes
        ],
        "task_lists": [
            {"id": _text(task_list.get("id"), 36), "name": _text(task_list.get("name"), 80)}
            for task_list in task_lists
        ],
    }

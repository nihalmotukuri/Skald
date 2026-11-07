import json
import logging

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.auth import CurrentUser, get_current_user
from app.config import Settings, get_cors_origins, get_settings
from app.context import load_user_context
from app.models import ChatRequest, ChatResult
from app.provider import generate_reply, stream_reply

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    application = FastAPI(title="Skald Mr Groff API", version="1.0.0")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(get_cors_origins()),
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @application.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @application.post("/api/chat", response_model=ChatResult)
    async def chat(
        request: ChatRequest,
        current_user: CurrentUser = Depends(get_current_user),
        settings: Settings = Depends(get_settings),
    ) -> ChatResult:
        context = await load_user_context(
            current_user.user_id,
            current_user.access_token,
            settings,
        )
        return await generate_reply(request.messages, context, settings)

    @application.post("/api/chat/stream")
    async def stream_chat(
        request: ChatRequest,
        current_user: CurrentUser = Depends(get_current_user),
        settings: Settings = Depends(get_settings),
    ) -> StreamingResponse:
        context = await load_user_context(
            current_user.user_id,
            current_user.access_token,
            settings,
        )

        async def events():
            try:
                async for item in stream_reply(request.messages, context, settings):
                    if isinstance(item, str):
                        payload = {"type": "delta", "text": item}
                    else:
                        payload = {
                            "type": "complete",
                            "reply": item.reply,
                            "proposals": [proposal.model_dump(mode="json") for proposal in item.proposals],
                        }
                    yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
            except HTTPException as error:
                yield f"data: {json.dumps({'type': 'error', 'detail': error.detail})}\n\n"
            except Exception:
                logger.exception("Unexpected error while streaming Mr Groff response")
                yield f"data: {json.dumps({'type': 'error', 'detail': 'Mr Groff could not complete that response.'})}\n\n"

        return StreamingResponse(
            events(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    return application


app = create_app()

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import CurrentUser, get_current_user
from app.config import Settings, get_cors_origins, get_settings
from app.context import load_user_context
from app.models import ChatRequest, ChatResult
from app.provider import generate_reply


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

    return application


app = create_app()

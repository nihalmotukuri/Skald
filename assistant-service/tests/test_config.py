from app.config import Settings, get_cors_origins


def test_default_cors_origins_include_common_vite_ports(monkeypatch) -> None:
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    assert get_cors_origins() == (
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    )


def test_cors_origins_can_be_configured(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "https://skald.example, http://localhost:5174")

    assert get_cors_origins() == (
        "https://skald.example",
        "http://localhost:5174",
    )


def test_default_model_is_available_gemini_flash(monkeypatch) -> None:
    for name in (
        "SUPABASE_URL",
        "SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_JWKS_URL",
        "GEMINI_API_KEY",
    ):
        monkeypatch.setenv(name, "test-value")
    monkeypatch.delenv("GEMINI_MODEL", raising=False)

    assert Settings.from_env().gemini_model == "gemini-3.5-flash"

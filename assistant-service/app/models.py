from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        content = value.strip()
        if not content:
            raise ValueError("Message content cannot be blank.")
        return content


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)

    @model_validator(mode="after")
    def conversation_must_end_with_user(self) -> "ChatRequest":
        if self.messages[-1].role != "user":
            raise ValueError("The latest conversation message must be from the user.")
        if sum(len(message.content) for message in self.messages) > 20_000:
            raise ValueError("Conversation history cannot exceed 20,000 characters.")
        return self


class ChatResponse(BaseModel):
    reply: str

from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

TaskPriority = Literal["low", "medium", "high"]
TaskStatus = Literal["pending", "in_progress", "done", "cancelled"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class CreateTaskProposal(StrictModel):
    action: Literal["create_task"]
    summary: str = Field(min_length=1, max_length=240)
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(default="", max_length=5000)
    due_at: datetime | None = None
    priority: TaskPriority = "medium"
    status: TaskStatus = "pending"
    task_list_id: UUID | None = None


class UpdateTaskProposal(StrictModel):
    action: Literal["update_task"]
    summary: str = Field(min_length=1, max_length=240)
    task_id: UUID
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(max_length=5000)
    due_at: datetime | None
    priority: TaskPriority
    status: TaskStatus
    task_list_id: UUID | None


class DeleteTaskProposal(StrictModel):
    action: Literal["delete_task"]
    summary: str = Field(min_length=1, max_length=240)
    task_id: UUID


class CreateNoteProposal(StrictModel):
    action: Literal["create_note"]
    summary: str = Field(min_length=1, max_length=240)
    title: str = Field(min_length=1, max_length=300)
    body: str = Field(max_length=20_000)


class UpdateNoteProposal(StrictModel):
    action: Literal["update_note"]
    summary: str = Field(min_length=1, max_length=240)
    note_id: UUID
    title: str = Field(min_length=1, max_length=300)
    body: str = Field(max_length=20_000)


class DeleteNoteProposal(StrictModel):
    action: Literal["delete_note"]
    summary: str = Field(min_length=1, max_length=240)
    note_id: UUID


ActionProposal = Annotated[
    CreateTaskProposal
    | UpdateTaskProposal
    | DeleteTaskProposal
    | CreateNoteProposal
    | UpdateNoteProposal
    | DeleteNoteProposal,
    Field(discriminator="action"),
]


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


class ChatResponse(StrictModel):
    reply: str = Field(min_length=1, max_length=8000)
    proposals: list[ActionProposal] = Field(default_factory=list, max_length=3)

    @field_validator("reply")
    @classmethod
    def reply_must_not_be_blank(cls, value: str) -> str:
        reply = value.strip()
        if not reply:
            raise ValueError("Assistant reply cannot be blank.")
        return reply


class ProposalEnvelope(StrictModel):
    id: UUID = Field(default_factory=uuid4)
    action: ActionProposal


class ChatResult(ChatResponse):
    proposals: list[ProposalEnvelope] = Field(default_factory=list, max_length=3)

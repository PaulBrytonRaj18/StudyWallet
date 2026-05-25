from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    is_markdown: bool = True
    subject_id: Optional[str] = None
    chapter_id: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_markdown: Optional[bool] = None
    subject_id: Optional[str] = None
    chapter_id: Optional[str] = None


class NoteResponse(BaseModel):
    id: UUID
    title: str
    content: Optional[str] = None
    is_markdown: bool
    user_id: UUID
    subject_id: Optional[UUID] = None
    chapter_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    notes: list[NoteResponse]
    total: int

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    is_markdown: bool = True
    subject_id: Optional[str] = None
    chapter_id: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    is_markdown: Optional[bool] = None
    subject_id: Optional[str] = None
    chapter_id: Optional[str] = None


class NoteResponse(BaseModel):
    id: str
    title: str
    content: Optional[str] = None
    is_markdown: bool
    user_id: str
    subject_id: Optional[str] = None
    chapter_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    notes: list[NoteResponse]
    total: int

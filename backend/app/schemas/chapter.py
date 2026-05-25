from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChapterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    order: Optional[int] = 0


class ChapterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class ChapterResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    order: int
    subject_id: UUID
    created_at: datetime
    updated_at: datetime
    resource_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ChapterListResponse(BaseModel):
    chapters: list[ChapterResponse]
    total: int

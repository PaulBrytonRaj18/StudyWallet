from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChapterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    order: Optional[int] = 0


class ChapterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    order: Optional[int] = None


class ChapterResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    order: int
    subject_id: str
    created_at: datetime
    updated_at: datetime
    resource_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ChapterListResponse(BaseModel):
    chapters: list[ChapterResponse]
    total: int

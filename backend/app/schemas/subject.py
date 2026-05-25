from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "#6366f1"
    icon: str = "book"


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class SubjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    color: str
    icon: str
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    chapter_count: Optional[int] = 0
    resource_count: Optional[int] = 0

    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    subjects: list[SubjectResponse]
    total: int

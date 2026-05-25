from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SubjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")
    icon: str = Field(default="book", max_length=50)


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")
    icon: Optional[str] = Field(None, max_length=50)


class SubjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    color: str
    icon: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    chapter_count: Optional[int] = 0
    resource_count: Optional[int] = 0

    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    subjects: list[SubjectResponse]
    total: int

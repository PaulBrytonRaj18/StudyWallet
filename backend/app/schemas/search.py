from uuid import UUID
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.constants.enums import (
    ResourceType,
    ResourceStatus,
    Importance,
    RESOURCE_TYPE_VALUES,
    RESOURCE_STATUS_VALUES,
    IMPORTANCE_VALUES,
)


class SearchQuery(BaseModel):
    q: str = ""
    type: Optional[str] = None
    status: Optional[str] = None
    importance: Optional[str] = None
    subject_id: Optional[str] = None
    chapter_id: Optional[str] = None
    tag: Optional[str] = None
    page: int = 1
    limit: int = 20

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in RESOURCE_TYPE_VALUES:
            raise ValueError(f"Invalid type '{v}'")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in RESOURCE_STATUS_VALUES:
            raise ValueError(f"Invalid status '{v}'")
        return v

    @field_validator("importance")
    @classmethod
    def validate_importance(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in IMPORTANCE_VALUES:
            raise ValueError(f"Invalid importance '{v}'")
        return v


class SearchResult(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    resource_type: ResourceType
    status: ResourceStatus
    importance: Importance
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    subject_name: Optional[str] = None
    chapter_name: Optional[str] = None
    tags: list[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
    page: int
    limit: int

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


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: str
    status: str = ResourceStatus.NOT_STARTED.value
    importance: str = Importance.NORMAL.value
    url: Optional[str] = None
    subject_id: str
    chapter_id: Optional[str] = None
    tags: Optional[list[str]] = []

    @field_validator("resource_type")
    @classmethod
    def validate_resource_type(cls, v: str) -> str:
        if v not in RESOURCE_TYPE_VALUES:
            raise ValueError(f"Invalid resource_type '{v}'")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in RESOURCE_STATUS_VALUES:
            raise ValueError(f"Invalid status '{v}'")
        return v

    @field_validator("importance")
    @classmethod
    def validate_importance(cls, v: str) -> str:
        if v not in IMPORTANCE_VALUES:
            raise ValueError(f"Invalid importance '{v}'")
        return v


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    importance: Optional[str] = None
    url: Optional[str] = None
    chapter_id: Optional[str] = None
    tags: Optional[list[str]] = None

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


class ResourceResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    resource_type: ResourceType
    status: ResourceStatus
    importance: Importance
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    user_id: UUID
    subject_id: UUID
    chapter_id: Optional[UUID] = None
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResourceListResponse(BaseModel):
    resources: list[ResourceResponse]
    total: int


class PDFUploadResponse(BaseModel):
    id: UUID
    title: str
    pdf_url: str
    file_name: str
    file_size: int
    resource_type: ResourceType = ResourceType.PDF
    message: str = "PDF uploaded successfully"

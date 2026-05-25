from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    resource_type: str = Field(..., pattern=r"^(pdf|chatgpt_link|youtube_link|note)$")
    status: str = Field(default="not_started", pattern=r"^(not_started|studying|completed|revision_pending)$")
    importance: str = Field(default="normal", pattern=r"^(normal|important|very_important)$")
    url: Optional[str] = None
    subject_id: str
    chapter_id: Optional[str] = None
    tags: Optional[list[str]] = []


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(not_started|studying|completed|revision_pending)$")
    importance: Optional[str] = Field(None, pattern=r"^(normal|important|very_important)$")
    url: Optional[str] = None
    chapter_id: Optional[str] = None
    tags: Optional[list[str]] = None


class ResourceResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    resource_type: str
    status: str
    importance: str
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    user_id: str
    subject_id: str
    chapter_id: Optional[str] = None
    tags: list[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResourceListResponse(BaseModel):
    resources: list[ResourceResponse]
    total: int


class PDFUploadResponse(BaseModel):
    id: str
    title: str
    pdf_url: str
    file_name: str
    file_size: int
    resource_type: str = "pdf"
    message: str = "PDF uploaded successfully"

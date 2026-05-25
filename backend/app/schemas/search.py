from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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


class SearchResult(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    resource_type: str
    status: str
    importance: str
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

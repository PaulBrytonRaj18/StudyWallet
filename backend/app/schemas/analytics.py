from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.constants.enums import ResourceType, ResourceStatus


class DashboardStats(BaseModel):
    total_subjects: int
    total_resources: int
    completed_resources: int
    revision_pending: int
    studying_resources: int
    not_started_resources: int
    pdf_count: int
    total_notes: int
    study_progress_percentage: float


class RecentUpload(BaseModel):
    id: UUID
    title: str
    resource_type: ResourceType
    subject_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SubjectProgress(BaseModel):
    subject_id: UUID
    subject_name: str
    color: str
    total: int
    completed: int
    percentage: float


class ProgressByStatus(BaseModel):
    status: ResourceStatus
    count: int


class AnalyticsResponse(BaseModel):
    stats: DashboardStats
    recent_uploads: list[RecentUpload]
    subject_progress: list[SubjectProgress]
    progress_by_status: list[ProgressByStatus]

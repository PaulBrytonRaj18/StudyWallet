from pydantic import BaseModel
from typing import Optional
from datetime import datetime


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
    id: str
    title: str
    resource_type: str
    subject_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SubjectProgress(BaseModel):
    subject_id: str
    subject_name: str
    color: str
    total: int
    completed: int
    percentage: float


class ProgressByStatus(BaseModel):
    status: str
    count: int


class AnalyticsResponse(BaseModel):
    stats: DashboardStats
    recent_uploads: list[RecentUpload]
    subject_progress: list[SubjectProgress]
    progress_by_status: list[ProgressByStatus]

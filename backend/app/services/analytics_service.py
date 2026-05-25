from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.resource import Resource
from app.models.subject import Subject
from app.models.note import Note
from app.schemas.analytics import (
    DashboardStats,
    RecentUpload,
    SubjectProgress,
    ProgressByStatus,
)


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard(self, user_id: str) -> dict:
        total_subjects = (
            self.db.query(Subject).filter(Subject.user_id == user_id).count()
        )

        resources_query = self.db.query(Resource).filter(Resource.user_id == user_id)
        total_resources = resources_query.count()

        completed_resources = resources_query.filter(
            Resource.status == "completed"
        ).count()

        revision_pending = resources_query.filter(
            Resource.status == "revision_pending"
        ).count()

        studying_resources = resources_query.filter(
            Resource.status == "studying"
        ).count()

        not_started = resources_query.filter(
            Resource.status == "not_started"
        ).count()

        pdf_count = resources_query.filter(
            Resource.resource_type == "pdf"
        ).count()

        total_notes = (
            self.db.query(Note).filter(Note.user_id == user_id).count()
        )

        study_progress_percentage = (
            (completed_resources / total_resources * 100) if total_resources > 0 else 0
        )

        recent = (
            self.db.query(Resource, Subject.name.label("subject_name"))
            .outerjoin(Subject, Resource.subject_id == Subject.id)
            .filter(Resource.user_id == user_id)
            .order_by(Resource.created_at.desc())
            .limit(5)
            .all()
        )

        recent_uploads = [
            RecentUpload(
                id=str(r.Resource.id),
                title=r.Resource.title,
                resource_type=r.Resource.resource_type.value,
                subject_name=r.subject_name,
                created_at=r.Resource.created_at,
            )
            for r in recent
        ]

        subject_progress_data = (
            self.db.query(
                Subject.id,
                Subject.name,
                Subject.color,
                func.count(Resource.id).label("total"),
                func.count(Resource.id)
                .filter(Resource.status == "completed")
                .label("completed"),
            )
            .outerjoin(Resource, Resource.subject_id == Subject.id)
            .filter(Subject.user_id == user_id)
            .group_by(Subject.id, Subject.name, Subject.color)
            .all()
        )

        subject_progress = []
        for s in subject_progress_data:
            pct = (s.completed / s.total * 100) if s.total > 0 else 0
            subject_progress.append(
                SubjectProgress(
                    subject_id=str(s.id),
                    subject_name=s.name,
                    color=s.color,
                    total=s.total,
                    completed=s.completed,
                    percentage=pct,
                )
            )

        status_counts = (
            self.db.query(
                Resource.status,
                func.count(Resource.id).label("count"),
            )
            .filter(Resource.user_id == user_id)
            .group_by(Resource.status)
            .all()
        )

        progress_by_status = [
            ProgressByStatus(status=s.status.value, count=s.count)
            for s in status_counts
        ]

        stats = DashboardStats(
            total_subjects=total_subjects,
            total_resources=total_resources,
            completed_resources=completed_resources,
            revision_pending=revision_pending,
            studying_resources=studying_resources,
            not_started_resources=not_started,
            pdf_count=pdf_count,
            total_notes=total_notes,
            study_progress_percentage=round(study_progress_percentage, 1),
        )

        return {
            "stats": stats,
            "recent_uploads": recent_uploads,
            "subject_progress": subject_progress,
            "progress_by_status": progress_by_status,
        }

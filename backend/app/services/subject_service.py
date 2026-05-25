from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.subject import Subject
from app.models.resource import Resource
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse


class SubjectService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, data: SubjectCreate) -> Subject:
        subject = Subject(
            name=data.name,
            description=data.description,
            color=data.color,
            icon=data.icon,
            user_id=user_id,
        )
        self.db.add(subject)
        self.db.commit()
        self.db.refresh(subject)
        return subject

    def get_all(self, user_id: str) -> list:
        subjects = (
            self.db.query(
                Subject,
                func.count(Resource.id.distinct()).label("resource_count"),
            )
            .outerjoin(Resource, Resource.subject_id == Subject.id)
            .filter(Subject.user_id == user_id)
            .group_by(Subject.id)
            .order_by(Subject.created_at.desc())
            .all()
        )

        result = []
        for subject, resource_count in subjects:
            s = SubjectResponse.from_orm(subject)
            s.resource_count = resource_count
            s.chapter_count = len(subject.chapters)
            result.append(s)

        return result

    def get_by_id(self, user_id: str, subject_id: str) -> Subject:
        subject = (
            self.db.query(Subject)
            .filter(Subject.id == subject_id, Subject.user_id == user_id)
            .first()
        )
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )
        return subject

    def update(self, user_id: str, subject_id: str, data: SubjectUpdate) -> Subject:
        subject = self.get_by_id(user_id, subject_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(subject, key, value)
        self.db.commit()
        self.db.refresh(subject)
        return subject

    def delete(self, user_id: str, subject_id: str) -> None:
        subject = self.get_by_id(user_id, subject_id)
        self.db.delete(subject)
        self.db.commit()

    def get_stats(self, user_id: str, subject_id: str) -> dict:
        subject = self.get_by_id(user_id, subject_id)
        total = self.db.query(Resource).filter(
            Resource.subject_id == subject_id,
            Resource.user_id == user_id,
        ).count()

        completed = self.db.query(Resource).filter(
            Resource.subject_id == subject_id,
            Resource.user_id == user_id,
            Resource.status == ResourceStatus.COMPLETED.value,
        ).count()

        return {
            "total": total,
            "completed": completed,
            "percentage": (completed / total * 100) if total > 0 else 0,
        }



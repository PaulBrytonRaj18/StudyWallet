from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.chapter import Chapter
from app.models.resource import Resource
from app.models.subject import Subject
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse


class ChapterService:
    def __init__(self, db: Session):
        self.db = db

    def _verify_subject_ownership(self, user_id: str, subject_id: str) -> Subject:
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

    def create(self, user_id: str, subject_id: str, data: ChapterCreate) -> Chapter:
        self._verify_subject_ownership(user_id, subject_id)

        chapter = Chapter(
            name=data.name,
            description=data.description,
            order=data.order,
            subject_id=subject_id,
        )
        self.db.add(chapter)
        self.db.commit()
        self.db.refresh(chapter)
        return chapter

    def get_all(self, user_id: str, subject_id: str) -> list:
        self._verify_subject_ownership(user_id, subject_id)

        chapters = (
            self.db.query(
                Chapter,
                func.count(Resource.id.distinct()).label("resource_count"),
            )
            .outerjoin(Resource, Resource.chapter_id == Chapter.id)
            .filter(Chapter.subject_id == subject_id)
            .group_by(Chapter.id)
            .order_by(Chapter.order, Chapter.created_at)
            .all()
        )

        result = []
        for chapter, resource_count in chapters:
            c = ChapterResponse.from_orm(chapter)
            c.resource_count = resource_count
            result.append(c)

        return result

    def get_by_id(self, user_id: str, subject_id: str, chapter_id: str) -> Chapter:
        self._verify_subject_ownership(user_id, subject_id)
        chapter = (
            self.db.query(Chapter)
            .filter(
                Chapter.id == chapter_id,
                Chapter.subject_id == subject_id,
            )
            .first()
        )
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chapter not found",
            )
        return chapter

    def update(
        self, user_id: str, subject_id: str, chapter_id: str, data: ChapterUpdate
    ) -> Chapter:
        chapter = self.get_by_id(user_id, subject_id, chapter_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(chapter, key, value)
        self.db.commit()
        self.db.refresh(chapter)
        return chapter

    def delete(self, user_id: str, subject_id: str, chapter_id: str) -> None:
        chapter = self.get_by_id(user_id, subject_id, chapter_id)
        self.db.delete(chapter)
        self.db.commit()

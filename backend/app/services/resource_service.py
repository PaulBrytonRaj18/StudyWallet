from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.resource import Resource, ResourceTag, ResourceType, ResourceStatus, Importance
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse


class ResourceService:
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

    def create(self, user_id: str, data: ResourceCreate) -> Resource:
        self._verify_subject_ownership(user_id, data.subject_id)

        if data.chapter_id:
            chapter = (
                self.db.query(Chapter)
                .filter(
                    Chapter.id == data.chapter_id,
                    Chapter.subject_id == data.subject_id,
                )
                .first()
            )
            if not chapter:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chapter not found in this subject",
                )

        resource = Resource(
            title=data.title,
            description=data.description,
            resource_type=data.resource_type,
            status=data.status,
            importance=data.importance,
            url=data.url,
            user_id=user_id,
            subject_id=data.subject_id,
            chapter_id=data.chapter_id,
        )

        self.db.add(resource)
        self.db.flush()

        if data.tags:
            for tag_name in data.tags:
                tag = ResourceTag(resource_id=resource.id, tag=tag_name.strip().lower())
                self.db.add(tag)

        self.db.commit()
        self.db.refresh(resource)
        return resource

    def get_all(
        self,
        user_id: str,
        subject_id: str,
        chapter_id: str = None,
        resource_type: str = None,
        status: str = None,
        importance: str = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Resource], int]:
        self._verify_subject_ownership(user_id, subject_id)

        query = self.db.query(Resource).filter(
            Resource.user_id == user_id,
            Resource.subject_id == subject_id,
        )

        if chapter_id:
            query = query.filter(Resource.chapter_id == chapter_id)
        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)
        if status:
            query = query.filter(Resource.status == status)
        if importance:
            query = query.filter(Resource.importance == importance)

        total = query.count()
        offset = (page - 1) * limit
        resources = query.order_by(Resource.created_at.desc()).offset(offset).limit(limit).all()

        return resources, total

    def get_by_id(self, user_id: str, resource_id: str) -> Resource:
        resource = (
            self.db.query(Resource)
            .filter(Resource.id == resource_id, Resource.user_id == user_id)
            .first()
        )
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found",
            )
        return resource

    def update(self, user_id: str, resource_id: str, data: ResourceUpdate) -> Resource:
        resource = self.get_by_id(user_id, resource_id)
        update_data = data.model_dump(exclude_unset=True)

        tags = update_data.pop("tags", None)

        for key, value in update_data.items():
            setattr(resource, key, value)

        if tags is not None:
            self.db.query(ResourceTag).filter(ResourceTag.resource_id == resource.id).delete()
            for tag_name in tags:
                tag = ResourceTag(resource_id=resource.id, tag=tag_name.strip().lower())
                self.db.add(tag)

        self.db.commit()
        self.db.refresh(resource)
        return resource

    def delete(self, user_id: str, resource_id: str) -> None:
        resource = self.get_by_id(user_id, resource_id)
        self.db.delete(resource)
        self.db.commit()

    def get_all_user_resources(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Resource], int]:
        query = self.db.query(Resource).filter(Resource.user_id == user_id)
        total = query.count()
        offset = (page - 1) * limit
        resources = query.order_by(Resource.created_at.desc()).offset(offset).limit(limit).all()
        return resources, total

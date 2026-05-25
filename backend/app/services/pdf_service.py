from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from app.models.resource import Resource, ResourceTag
from app.constants.enums import ResourceType, ResourceStatus, Importance, IMPORTANCE_VALUES
from app.models.subject import Subject
from app.utils.supabase import upload_pdf_to_storage, delete_pdf_from_storage, get_signed_url


class PDFService:
    def __init__(self, db: Session):
        self.db = db

    def upload(
        self,
        user_id: str,
        file: UploadFile,
        title: str,
        subject_id: str,
        chapter_id: str = None,
        description: str = None,
        tags: list[str] = None,
        importance: str = Importance.NORMAL.value,
    ) -> Resource:
        if importance not in IMPORTANCE_VALUES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid importance '{importance}'. Must be one of: {', '.join(sorted(IMPORTANCE_VALUES))}",
            )
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

        pdf_url, file_name, file_size = upload_pdf_to_storage(user_id, file)

        resource = Resource(
            title=title,
            description=description,
            resource_type=ResourceType.PDF.value,
            status=ResourceStatus.NOT_STARTED,
            importance=importance,
            pdf_url=pdf_url,
            file_name=file_name,
            file_size=file_size,
            user_id=user_id,
            subject_id=subject_id,
            chapter_id=chapter_id,
        )

        self.db.add(resource)
        self.db.flush()

        if tags:
            for tag_name in tags:
                tag = ResourceTag(resource_id=resource.id, tag=tag_name.strip().lower())
                self.db.add(tag)

        self.db.commit()
        self.db.refresh(resource)
        return resource

    def get_signed_pdf_url(self, user_id: str, resource_id: str) -> str:
        resource = (
            self.db.query(Resource)
            .filter(
                Resource.id == resource_id,
                Resource.user_id == user_id,
                Resource.resource_type == ResourceType.PDF.value,
            )
            .first()
        )
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF not found",
            )

        if not resource.file_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF file not found in storage",
            )

        signed_url = get_signed_url(user_id, resource.file_name)
        if not signed_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate signed URL",
            )

        return signed_url

    def delete(self, user_id: str, resource_id: str) -> None:
        resource = (
            self.db.query(Resource)
            .filter(
                Resource.id == resource_id,
                Resource.user_id == user_id,
                Resource.resource_type == ResourceType.PDF.value,
            )
            .first()
        )
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF not found",
            )

        if resource.file_name:
            delete_pdf_from_storage(user_id, resource.file_name)

        self.db.delete(resource)
        self.db.commit()

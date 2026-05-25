from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.constants.enums import Importance
from app.schemas.resource import ResourceResponse
from app.services.pdf_service import PDFService
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.routers.resources import _format_resource

router = APIRouter(prefix="/api/pdfs", tags=["PDFs"])


@router.post("/upload", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def upload_pdf(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject_id: str = Form(...),
    chapter_id: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    importance: str = Form(Importance.NORMAL.value),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PDFService(db)
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    resource = service.upload(
        str(current_user.id),
        file,
        title,
        subject_id,
        chapter_id,
        description,
        tag_list,
        importance,
    )
    return _format_resource(resource)


@router.get("/{resource_id}/signed-url")
def get_signed_url(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PDFService(db)
    url = service.get_signed_pdf_url(str(current_user.id), resource_id)
    return {"signed_url": url, "resource_id": resource_id}


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pdf(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PDFService(db)
    service.delete(str(current_user.id), resource_id)

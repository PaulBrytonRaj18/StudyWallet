from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse, ChapterListResponse
from app.services.chapter_service import ChapterService
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/subjects/{subject_id}/chapters", tags=["Chapters"])


@router.post("", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
def create_chapter(
    subject_id: str,
    data: ChapterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)
    chapter = service.create(str(current_user.id), subject_id, data)
    return ChapterResponse.from_orm(chapter)


@router.get("", response_model=ChapterListResponse)
def list_chapters(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)
    chapters = service.get_all(str(current_user.id), subject_id)
    return {"chapters": chapters, "total": len(chapters)}


@router.get("/{chapter_id}", response_model=ChapterResponse)
def get_chapter(
    subject_id: str,
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)
    chapter = service.get_by_id(str(current_user.id), subject_id, chapter_id)
    return ChapterResponse.from_orm(chapter)


@router.put("/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    subject_id: str,
    chapter_id: str,
    data: ChapterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)
    chapter = service.update(str(current_user.id), subject_id, chapter_id, data)
    return ChapterResponse.from_orm(chapter)


@router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(
    subject_id: str,
    chapter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ChapterService(db)
    service.delete(str(current_user.id), subject_id, chapter_id)

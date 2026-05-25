from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse, SubjectListResponse
from app.services.subject_service import SubjectService
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SubjectService(db)
    subject = service.create(str(current_user.id), data)
    return SubjectResponse.from_orm(subject)


@router.get("", response_model=SubjectListResponse)
def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SubjectService(db)
    subjects = service.get_all(str(current_user.id))
    return {"subjects": subjects, "total": len(subjects)}


@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SubjectService(db)
    subject = service.get_by_id(str(current_user.id), subject_id)
    return SubjectResponse.from_orm(subject)


@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SubjectService(db)
    subject = service.update(str(current_user.id), subject_id, data)
    return SubjectResponse.from_orm(subject)


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SubjectService(db)
    service.delete(str(current_user.id), subject_id)


@router.get("/{subject_id}/stats")
def get_subject_stats(
    subject_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SubjectService(db)
    return service.get_stats(str(current_user.id), subject_id)

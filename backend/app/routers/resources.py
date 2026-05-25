from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse, ResourceListResponse
from app.services.resource_service import ResourceService
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/subjects/{subject_id}/resources", tags=["Resources"])


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    subject_id: str,
    data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    resource = service.create(str(current_user.id), data)
    return _format_resource(resource)


@router.get("", response_model=ResourceListResponse)
def list_resources(
    subject_id: str,
    chapter_id: str = Query(None),
    resource_type: str = Query(None),
    status: str = Query(None),
    importance: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    resources, total = service.get_all(
        str(current_user.id),
        subject_id,
        chapter_id,
        resource_type,
        status,
        importance,
        page,
        limit,
    )
    return {
        "resources": [_format_resource(r) for r in resources],
        "total": total,
    }


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    subject_id: str,
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    resource = service.get_by_id(str(current_user.id), resource_id)
    return _format_resource(resource)


@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    subject_id: str,
    resource_id: str,
    data: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    resource = service.update(str(current_user.id), resource_id, data)
    return _format_resource(resource)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    subject_id: str,
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = ResourceService(db)
    service.delete(str(current_user.id), resource_id)


def _format_resource(resource):
    return ResourceResponse(
        id=str(resource.id),
        title=resource.title,
        description=resource.description,
        resource_type=resource.resource_type.value if hasattr(resource.resource_type, 'value') else resource.resource_type,
        status=resource.status.value if hasattr(resource.status, 'value') else resource.status,
        importance=resource.importance.value if hasattr(resource.importance, 'value') else resource.importance,
        url=resource.url,
        pdf_url=resource.pdf_url,
        file_name=resource.file_name,
        file_size=resource.file_size,
        user_id=str(resource.user_id),
        subject_id=str(resource.subject_id),
        chapter_id=str(resource.chapter_id) if resource.chapter_id else None,
        tags=[t.tag for t in resource.tags],
        created_at=resource.created_at,
        updated_at=resource.updated_at,
    )

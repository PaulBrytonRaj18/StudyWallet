from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import SearchService
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def search_resources(
    q: str = Query(""),
    resource_type: str = Query(None),
    status: str = Query(None),
    importance: str = Query(None),
    subject_id: str = Query(None),
    chapter_id: str = Query(None),
    tag: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = SearchService(db)
    results, total = service.search(
        str(current_user.id),
        q,
        resource_type,
        status,
        importance,
        subject_id,
        chapter_id,
        tag,
        page,
        limit,
    )
    return {
        "results": [r for r in results],
        "total": total,
        "page": page,
        "limit": limit,
    }

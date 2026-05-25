from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.resource import Resource, ResourceTag
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.schemas.search import SearchResult


class SearchService:
    def __init__(self, db: Session):
        self.db = db

    def search(
        self,
        user_id: str,
        q: str = "",
        resource_type: str = None,
        status: str = None,
        importance: str = None,
        subject_id: str = None,
        chapter_id: str = None,
        tag: str = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[SearchResult], int]:
        query = (
            self.db.query(
                Resource,
                Subject.name.label("subject_name"),
                Chapter.name.label("chapter_name"),
            )
            .outerjoin(Subject, Resource.subject_id == Subject.id)
            .outerjoin(Chapter, Resource.chapter_id == Chapter.id)
            .filter(Resource.user_id == user_id)
        )

        if q:
            search_filter = or_(
                Resource.title.ilike(f"%{q}%"),
                Resource.description.ilike(f"%{q}%"),
            )
            query = query.filter(search_filter)

        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)
        if status:
            query = query.filter(Resource.status == status)
        if importance:
            query = query.filter(Resource.importance == importance)
        if subject_id:
            query = query.filter(Resource.subject_id == subject_id)
        if chapter_id:
            query = query.filter(Resource.chapter_id == chapter_id)
        if tag:
            query = query.join(ResourceTag).filter(ResourceTag.tag == tag.lower())

        total = query.count()
        offset = (page - 1) * limit
        results = query.order_by(Resource.updated_at.desc()).offset(offset).limit(limit).all()

        search_results = []
        for resource, subject_name, chapter_name in results:
            tags = [t.tag for t in resource.tags]
            search_results.append(
                SearchResult(
                    id=str(resource.id),
                    title=resource.title,
                    description=resource.description,
                    resource_type=resource.resource_type.value if hasattr(resource.resource_type, 'value') else resource.resource_type,
                    status=resource.status.value if hasattr(resource.status, 'value') else resource.status,
                    importance=resource.importance.value if hasattr(resource.importance, 'value') else resource.importance,
                    url=resource.url,
                    pdf_url=resource.pdf_url,
                    subject_name=subject_name,
                    chapter_name=chapter_name,
                    tags=tags,
                    created_at=resource.created_at,
                )
            )

        return search_results, total

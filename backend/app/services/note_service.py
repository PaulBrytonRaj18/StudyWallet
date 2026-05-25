from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


class NoteService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, data: NoteCreate) -> Note:
        note = Note(
            title=data.title,
            content=data.content,
            is_markdown=data.is_markdown,
            user_id=user_id,
            subject_id=data.subject_id,
            chapter_id=data.chapter_id,
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def get_all(self, user_id: str, subject_id: str = None, page: int = 1, limit: int = 20) -> tuple[list[Note], int]:
        query = self.db.query(Note).filter(Note.user_id == user_id)
        if subject_id:
            query = query.filter(Note.subject_id == subject_id)
        total = query.count()
        offset = (page - 1) * limit
        notes = query.order_by(Note.updated_at.desc()).offset(offset).limit(limit).all()
        return notes, total

    def get_by_id(self, user_id: str, note_id: str) -> Note:
        note = (
            self.db.query(Note)
            .filter(Note.id == note_id, Note.user_id == user_id)
            .first()
        )
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found",
            )
        return note

    def update(self, user_id: str, note_id: str, data: NoteUpdate) -> Note:
        note = self.get_by_id(user_id, note_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(note, key, value)
        self.db.commit()
        self.db.refresh(note)
        return note

    def delete(self, user_id: str, note_id: str) -> None:
        note = self.get_by_id(user_id, note_id)
        self.db.delete(note)
        self.db.commit()

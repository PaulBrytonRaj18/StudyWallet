import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ResourceType(str, enum.Enum):
    PDF = "pdf"
    CHATGPT_LINK = "chatgpt_link"
    YOUTUBE_LINK = "youtube_link"
    NOTE = "note"


class ResourceStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    STUDYING = "studying"
    COMPLETED = "completed"
    REVISION_PENDING = "revision_pending"


class Importance(str, enum.Enum):
    NORMAL = "normal"
    IMPORTANT = "important"
    VERY_IMPORTANT = "very_important"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(SAEnum(ResourceType), nullable=False, index=True)
    status = Column(SAEnum(ResourceStatus), default=ResourceStatus.NOT_STARTED, index=True)
    importance = Column(SAEnum(Importance), default=Importance.NORMAL)

    url = Column(String(1000), nullable=True)
    pdf_url = Column(String(1000), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resources")
    subject = relationship("Subject", back_populates="resources")
    chapter = relationship("Chapter", back_populates="resources")
    tags = relationship("ResourceTag", back_populates="resource", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Resource {self.title}>"


class ResourceTag(Base):
    __tablename__ = "resource_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_id = Column(UUID(as_uuid=True), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    tag = Column(String(50), nullable=False, index=True)

    resource = relationship("Resource", back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.tag}>"

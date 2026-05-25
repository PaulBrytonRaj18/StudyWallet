import enum as _enum
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Enum as _SaEnum
from app.config import settings


class PgEnum(_SaEnum):
    """SQLAlchemy Enum subclass that serializes Python enum values (not names)
    to the database.

    SQLAlchemy's default ``Enum`` type uses ``.name`` for DB serialization
    (e.g. ``ResourceType.PDF.name → "PDF"``), but our PostgreSQL enums are
    defined with lowercase values (e.g. ``"pdf"``). This subclass overrides
    ``bind_processor`` and ``result_processor`` to use ``.value`` instead,
    ensuring Python enum members are stored as their value strings.
    """

    def bind_processor(self, dialect):
        """Always use .value for enum member serialization.
        This bypasses the PostgreSQL-native ENUM adaptation that uses .name.
        """
        def process(value):
            if value is None:
                return None
            if isinstance(value, self.enum_class):
                return value.value
            return value
        return process

    def result_processor(self, dialect, coltype):
        """Restore Python enum members from DB values using .value lookup."""
        def process(value):
            if value is None:
                return None
            try:
                return self.enum_class(value)
            except (ValueError, LookupError):
                return value
        return process

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DATABASE_ECHO,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception:
        return False

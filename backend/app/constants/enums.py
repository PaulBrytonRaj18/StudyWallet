"""
Centralized enum definitions — SINGLE SOURCE OF TRUTH.

All enum values across the entire stack derive from this file.
PostgreSQL enum types, SQLAlchemy columns, Pydantic schemas,
and frontend constants all reference these definitions.

If you add/remove/rename a value, change it HERE and then run:
    python -m app.constants.enums
to validate DB consistency.
"""

import enum
import logging
from typing import Final

logger = logging.getLogger("studywallet.enums")


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


# Public collections for validation / iteration
RESOURCE_TYPE_VALUES: Final[set[str]] = {m.value for m in ResourceType}
RESOURCE_STATUS_VALUES: Final[set[str]] = {m.value for m in ResourceStatus}
IMPORTANCE_VALUES: Final[set[str]] = {m.value for m in Importance}


# Map: SQLAlchemy column name → Python enum class
# Used by startup validation to compare against PostgreSQL.
ENUM_REGISTRY: Final[dict[str, type[enum.Enum]]] = {
    "resource_type": ResourceType,
    "resource_status": ResourceStatus,
    "importance_level": Importance,
}


def enum_values_match_db(engine) -> dict[str, list[str]]:
    """Compare Python enum values against live PostgreSQL enum definitions.

    Returns a dict of {pg_type_name: [mismatches]} where each mismatch is
    ``"{direction}: {value}"`` — from_python or from_db.
    """
    from sqlalchemy import text

    mismatches: dict[str, list[str]] = {}

    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT t.typname AS enum_name,
                       array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                GROUP BY t.typname
            """)
        ).fetchall()

    db_enums: dict[str, set[str]] = {r[0]: set(r[1]) for r in rows}

    for pg_name, py_enum_cls in ENUM_REGISTRY.items():
        py_values = {m.value for m in py_enum_cls}
        db_values = db_enums.get(pg_name, set())

        issues: list[str] = []
        for v in py_values - db_values:
            issues.append(f"from_python: '{v}' exists in Python but NOT in PostgreSQL enum '{pg_name}'")
        for v in db_values - py_values:
            issues.append(f"from_db: '{v}' exists in PostgreSQL enum '{pg_name}' but NOT in Python")

        if issues:
            mismatches[pg_name] = issues

    return mismatches


def check_enum_consistency(engine) -> bool:
    """Run at startup. Log warnings/errors for any mismatches. Return True if OK."""
    mismatches = enum_values_match_db(engine)
    if not mismatches:
        logger.info("Enum consistency check PASSED — all %d enums match the database.", len(ENUM_REGISTRY))
        return True

    for pg_name, issues in mismatches.items():
        logger.error("Enum MISMATCH for PostgreSQL type '%s':", pg_name)
        for issue in issues:
            logger.error("  %s", issue)

    logger.error(
        "Enum consistency check FAILED. "
        "Run `python -m app.constants.enums` for details, "
        "then run `alembic upgrade head` to sync the database."
    )
    return False


if __name__ == "__main__":
    """Standalone check: validates enum consistency against the live DB."""
    import sys
    sys.path.insert(0, ".")

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    from app.database import engine

    mismatches = enum_values_match_db(engine)
    if not mismatches:
        print("All enums are consistent.")
        sys.exit(0)

    for pg_name, issues in mismatches.items():
        print(f"\nMismatches for '{pg_name}':")
        for issue in issues:
            print(f"  {issue}")
    sys.exit(1)

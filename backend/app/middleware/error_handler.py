import json
import re
import traceback
import logging
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import DataError

logger = logging.getLogger("studywallet.errors")


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = err.get("loc", [])
        field = " -> ".join(str(l) for l in loc)
        msg = err.get("msg", "Validation error")

        input_val = err.get("input")
        ctx = err.get("ctx", {})

        sanitized = _sanitize_input(input_val, field)

        logger.warning(
            "Validation error [%s] %s %s — field=%s msg=%s input=%s ctx=%s",
            getattr(request.state, "request_id", "-"),
            request.method,
            request.url.path,
            field,
            msg,
            sanitized,
            ctx,
        )

        errors.append({
            "field": field,
            "message": msg,
            "input": sanitized,
        })

    body = _extract_body(request)
    if body:
        logger.info("Request body [%s]: %s", getattr(request.state, "request_id", "-"), body)

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation failed",
            "errors": errors,
        },
    )


def _sanitize_input(value: object, field: str) -> str:
    if value is None:
        return "null"
    s = str(value)
    if "password" in field.lower():
        return f"<{len(s)} chars hidden>"
    if len(s) > 100:
        return s[:100] + "..."
    return s


def _extract_body(request: Request) -> str:
    try:
        if hasattr(request, "_body") and request._body:
            body_str = request._body.decode()
            try:
                parsed = json.loads(body_str)
                if isinstance(parsed, dict):
                    cleaned = {k: (f"<{len(v)} chars>" if k == "password" else v) for k, v in parsed.items()}
                    return json.dumps(cleaned)
            except (json.JSONDecodeError, ValueError, TypeError):
                pass
            return body_str[:500]
    except Exception:
        pass
    return ""


async def db_enum_exception_handler(request: Request, exc: DataError):
    """Translate psycopg2 InvalidTextRepresentation (bad enum values) into clean 400s."""
    orig = str(exc.orig) if exc.orig else ""
    error_id = getattr(request.state, "request_id", "unknown")

    if "invalid input value for enum" in orig:
        m = re.search(r"invalid input value for enum (\w+):\s*\"([^\"]+)\"", orig)
        if m:
            enum_name = m.group(1)
            bad_value = m.group(2)
            logger.warning(
                "Enum violation [%s] %s %s — invalid value '%s' for enum '%s'",
                error_id, request.method, request.url.path, bad_value, enum_name,
            )
            return JSONResponse(
                status_code=400,
                content={
                    "detail": f"Invalid value '{bad_value}' for {enum_name}. Please check the allowed values.",
                    "error_id": error_id,
                },
            )

    logger.error("Database DataError [%s] %s: %s", error_id, request.url.path, traceback.format_exc())
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid data value sent to database.", "error_id": error_id},
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def general_exception_handler(request: Request, exc: Exception):
    error_id = getattr(request.state, "request_id", "unknown")
    logger.error(
        "Unhandled exception [%s] %s: %s\n%s",
        error_id,
        request.method,
        request.url.path,
        traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": error_id,
        },
    )

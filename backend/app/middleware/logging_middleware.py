import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("studywallet.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start

        logger.info(
            "%s %s %d %.3fms [%s]",
            request.method,
            request.url.path,
            response.status_code,
            elapsed * 1000,
            getattr(request.state, "request_id", "-"),
        )
        return response

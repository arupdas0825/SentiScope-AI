"""Structured error handling and exceptions for SentiScope AI."""
from typing import Any, Dict, List, Optional
import uuid
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    issue: str
    limit: Optional[Any] = None


class ErrorPayload(BaseModel):
    code: str
    message: str
    details: Optional[List[Dict[str, Any]]] = None
    request_id: str


class ErrorResponse(BaseModel):
    error: ErrorPayload


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or []


class ValidationFailed(AppException):
    def __init__(self, message: str, details: Optional[List[Dict[str, Any]]] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
        )


class PayloadTooLarge(AppException):
    def __init__(self, message: str = "Payload exceeds size limits"):
        super().__init__(
            code="PAYLOAD_TOO_LARGE",
            message=message,
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )


class ModelUnavailable(AppException):
    def __init__(self, message: str = "Model engine is currently unavailable"):
        super().__init__(
            code="MODEL_UNAVAILABLE",
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    payload = {
        "error": {
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
            "request_id": request_id,
        }
    }
    return JSONResponse(status_code=exc.status_code, content=payload)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    formatted_errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        formatted_errors.append({
            "field": loc,
            "issue": err.get("msg", "Validation error"),
            "type": err.get("type", "value_error"),
        })

    payload = {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Input validation failed. Please check the request fields.",
            "details": formatted_errors,
            "request_id": request_id,
        }
    }
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=payload)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    # Do not expose internal traceback to the client (SECURITY.md §12)
    payload = {
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "An internal server error occurred. Please contact the administrator.",
            "details": [],
            "request_id": request_id,
        }
    }
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=payload)


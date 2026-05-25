import uuid
import re
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from supabase import create_client, Client
from app.config import settings

_supabase_client: Optional[Client] = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _supabase_client


def sanitize_filename(filename: str) -> str:
    name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "pdf")
    name = re.sub(r"[^a-zA-Z0-9_-]", "_", name)
    name = re.sub(r"_+", "_", name).strip("_")
    return f"{name}.{ext}"


def generate_unique_filename(user_id: str, original_filename: str) -> str:
    safe_name = sanitize_filename(original_filename)
    timestamp = int(uuid.uuid4().hex[:12], 16)
    return f"{user_id}_{timestamp}_{safe_name}"


def validate_pdf(file: UploadFile) -> None:
    if file.content_type not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Only PDFs are allowed. Got: {file.content_type}",
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB",
        )

    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded",
        )


def upload_pdf_to_storage(user_id: str, file: UploadFile) -> tuple[str, str, int]:
    supabase = get_supabase()
    validate_pdf(file)
    unique_filename = generate_unique_filename(user_id, file.filename or "document.pdf")
    bucket = settings.SUPABASE_STORAGE_BUCKET

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    file_bytes = file.file.read()

    try:
        supabase.storage.from_(bucket).upload(
            path=f"users/{user_id}/{unique_filename}",
            file=file_bytes,
            file_options={"content-type": "application/pdf"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload PDF to storage: {str(e)}",
        )

    pdf_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/users/{user_id}/{unique_filename}"
    return pdf_url, unique_filename, file_size


def get_signed_url(user_id: str, file_name: str, expires_in: int = 3600) -> Optional[str]:
    supabase = get_supabase()
    try:
        bucket = settings.SUPABASE_STORAGE_BUCKET
        file_path = f"users/{user_id}/{file_name}"
        signed_url = supabase.storage.from_(bucket).create_signed_url(file_path, expires_in)
        if signed_url and isinstance(signed_url, dict):
            return signed_url.get("signedURL")
        return signed_url
    except Exception:
        return None


def delete_pdf_from_storage(user_id: str, file_name: str) -> bool:
    supabase = get_supabase()
    try:
        bucket = settings.SUPABASE_STORAGE_BUCKET
        file_path = f"users/{user_id}/{file_name}"
        supabase.storage.from_(bucket).remove([file_path])
        return True
    except Exception:
        return False

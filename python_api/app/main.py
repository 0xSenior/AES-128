"""FastAPI entry point for the AES-128 Lab service."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app.core.aes_cipher import AESCipher
from app.schemas import CipherRequest, CipherResponse
from app.utils import decode_hex

app = FastAPI(title="AES-128 Lab", version="0.1.0")


def _frontend_dir() -> Path:
    """Locate the frontend directory relative to the working directory or module."""
    for parent in (Path.cwd(), *Path(__file__).resolve().parents):
        candidate = parent / 'frontend'
        if candidate.is_dir():
            return candidate
    return Path(__file__).resolve().parent.parent.parent / 'frontend'


FRONTEND_DIR = _frontend_dir()


@app.get("/api/health")
def health() -> dict[str, str]:
    """Return service availability."""
    return {"status": "ok", "service": "aes-128-python"}


def build_cipher(request: CipherRequest) -> AESCipher:
    """Create a cipher from a validated hexadecimal request."""
    try:
        key = decode_hex(request.key, 'key')
        iv = decode_hex(request.iv, 'iv') if request.iv is not None else None
        return AESCipher(key, request.mode, iv)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post('/api/encrypt', response_model=CipherResponse)
def encrypt(request: CipherRequest) -> CipherResponse:
    """Encrypt hexadecimal plaintext with AES-128 and PKCS#7 padding."""
    cipher = build_cipher(request)
    try:
        data = decode_hex(request.data, 'data')
        return CipherResponse(data=cipher.encrypt(data).hex(), mode=request.mode)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post('/api/decrypt', response_model=CipherResponse)
def decrypt(request: CipherRequest) -> CipherResponse:
    """Decrypt hexadecimal ciphertext and remove PKCS#7 padding."""
    cipher = build_cipher(request)
    try:
        data = decode_hex(request.data, 'data')
        return CipherResponse(data=cipher.decrypt(data).hex(), mode=request.mode)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


if FRONTEND_DIR.is_dir():
    app.mount('/', StaticFiles(directory=FRONTEND_DIR, html=True), name='frontend')

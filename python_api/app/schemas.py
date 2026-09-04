"""Request and response schemas for the AES API."""

from typing import Literal

from pydantic import BaseModel, Field


class CipherRequest(BaseModel):
    """Hex-encoded AES operation input."""

    key: str = Field(min_length=32, max_length=32, description="Exactly 16 bytes as hexadecimal")
    data: str = Field(min_length=2, description="Plaintext or ciphertext as hexadecimal")
    mode: Literal['ecb', 'cbc'] = 'ecb'
    iv: str | None = Field(default=None, description="Exactly 16 bytes as hexadecimal for CBC")


class CipherResponse(BaseModel):
    """Hex-encoded AES operation output."""

    data: str
    mode: Literal['ecb', 'cbc']

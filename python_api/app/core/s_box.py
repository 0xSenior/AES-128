"""AES S-box operations."""

from app.constants import INV_S_BOX, S_BOX


class SBox:
    """Provide forward and inverse byte substitution."""

    @staticmethod
    def substitute(byte: int) -> int:
        """Substitute one byte using the AES S-box."""
        return S_BOX[byte & 0xFF]

    @staticmethod
    def inverse_substitute(byte: int) -> int:
        """Substitute one byte using the inverse AES S-box."""
        return INV_S_BOX[byte & 0xFF]

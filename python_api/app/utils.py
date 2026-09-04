"""Small validation helpers for the API boundary."""


def decode_hex(value: str, field_name: str) -> bytes:
    """Decode an even-length hexadecimal field with a descriptive error."""
    try:
        return bytes.fromhex(value)
    except ValueError as error:
        raise ValueError(f'{field_name} must be valid hexadecimal.') from error

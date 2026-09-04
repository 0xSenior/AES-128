"""Arithmetic in the AES finite field GF(2^8)."""


def multiply(a: int, b: int) -> int:
    """Multiply bytes modulo x^8 + x^4 + x^3 + x + 1."""
    multiplicand = a & 0xFF
    multiplier = b & 0xFF
    product = 0
    for _ in range(8):
        if multiplier & 1:
            product ^= multiplicand
        high_bit = multiplicand & 0x80
        multiplicand = (multiplicand << 1) & 0xFF
        if high_bit:
            multiplicand ^= 0x1B
        multiplier >>= 1
    return product

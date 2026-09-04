"""Pure Python AES-128 encryption and decryption."""

from app.core.key_scheduler import KeyScheduler
from app.core.state_matrix import StateMatrix


class AESCipher:
    """Encrypt and decrypt AES-128 data in ECB or CBC mode."""

    def __init__(self, key: bytes, mode: str = 'ecb', iv: bytes | None = None) -> None:
        if len(key) != 16:
            raise ValueError('AES-128 keys must contain exactly 16 bytes.')
        if mode not in ('ecb', 'cbc'):
            raise ValueError("Mode must be 'ecb' or 'cbc'.")
        if mode == 'cbc' and (iv is None or len(iv) != 16):
            raise ValueError('CBC mode requires a 16-byte IV.')
        self.mode = mode
        self.iv = bytes(iv) if iv is not None else None
        self.key_scheduler = KeyScheduler(key)

    def encrypt_block(self, block: bytes) -> bytes:
        """Encrypt one unpadded 16-byte block."""
        self._validate_block(block)
        state = StateMatrix(self._bytes_to_matrix(block))
        state.add_round_key(self.key_scheduler.get_round_key(0))
        for round_index in range(1, 10):
            state.sub_bytes().shift_rows().mix_columns().add_round_key(self.key_scheduler.get_round_key(round_index))
        state.sub_bytes().shift_rows().add_round_key(self.key_scheduler.get_round_key(10))
        return self._matrix_to_bytes(state.data)

    def decrypt_block(self, block: bytes) -> bytes:
        """Decrypt one unpadded 16-byte block."""
        self._validate_block(block)
        state = StateMatrix(self._bytes_to_matrix(block))
        state.add_round_key(self.key_scheduler.get_round_key(10))
        for round_index in range(9, 0, -1):
            state.inverse_shift_rows().inverse_sub_bytes().add_round_key(self.key_scheduler.get_round_key(round_index)).inverse_mix_columns()
        state.inverse_shift_rows().inverse_sub_bytes().add_round_key(self.key_scheduler.get_round_key(0))
        return self._matrix_to_bytes(state.data)

    def encrypt(self, data: bytes) -> bytes:
        """Encrypt data with PKCS#7 padding."""
        padded = self._pad(data)
        result = bytearray()
        previous = self.iv
        for offset in range(0, len(padded), 16):
            block = padded[offset:offset + 16]
            if self.mode == 'cbc':
                block = self._xor(block, previous or bytes(16))
            encrypted = self.encrypt_block(block)
            result.extend(encrypted)
            previous = encrypted
        return bytes(result)

    def decrypt(self, data: bytes) -> bytes:
        """Decrypt data and validate PKCS#7 padding."""
        if not data or len(data) % 16:
            raise ValueError('Ciphertext must be a non-empty multiple of 16 bytes.')
        result = bytearray()
        previous = self.iv
        for offset in range(0, len(data), 16):
            block = data[offset:offset + 16]
            plain = self.decrypt_block(block)
            if self.mode == 'cbc':
                plain = self._xor(plain, previous or bytes(16))
            result.extend(plain)
            previous = block
        return self._unpad(bytes(result))

    @staticmethod
    def _pad(data: bytes) -> bytes:
        length = 16 - len(data) % 16
        return data + bytes([length]) * length

    @staticmethod
    def _unpad(data: bytes) -> bytes:
        length = data[-1]
        if not 1 <= length <= 16 or data[-length:] != bytes([length]) * length:
            raise ValueError('Invalid PKCS#7 padding.')
        return data[:-length]

    @staticmethod
    def _xor(left: bytes, right: bytes) -> bytes:
        return bytes(a ^ b for a, b in zip(left, right, strict=True))

    @staticmethod
    def _validate_block(block: bytes) -> None:
        if len(block) != 16:
            raise ValueError('AES blocks must contain exactly 16 bytes.')

    @staticmethod
    def _bytes_to_matrix(block: bytes) -> list[list[int]]:
        return [[block[column * 4 + row] for column in range(4)] for row in range(4)]

    @staticmethod
    def _matrix_to_bytes(matrix: list[list[int]]) -> bytes:
        return bytes(matrix[row][column] for column in range(4) for row in range(4))

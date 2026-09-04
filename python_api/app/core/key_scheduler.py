"""AES-128 Rijndael key expansion."""

from app.constants import RCON
from app.core.s_box import SBox


class KeyScheduler:
    """Expand a 16-byte AES key into eleven state-shaped round keys."""

    def __init__(self, master_key: bytes) -> None:
        if len(master_key) != 16:
            raise ValueError('AES-128 keys must contain exactly 16 bytes.')
        self.round_keys: list[list[list[int]]] = []
        self.expand_key(master_key)

    def expand_key(self, master_key: bytes) -> None:
        """Expand the master key into 44 words and 11 round keys."""
        if len(master_key) != 16:
            raise ValueError('AES-128 keys must contain exactly 16 bytes.')
        words = [list(master_key[index:index + 4]) for index in range(0, 16, 4)]
        for index in range(4, 44):
            previous = words[index - 1][:]
            if index % 4 == 0:
                previous = [SBox.substitute(previous[1]), SBox.substitute(previous[2]), SBox.substitute(previous[3]), SBox.substitute(previous[0])]
                previous[0] ^= RCON[index // 4 - 1]
            words.append([words[index - 4][byte] ^ previous[byte] for byte in range(4)])
        self.round_keys = [
            [[words[round_index * 4 + column][row] for column in range(4)] for row in range(4)]
            for round_index in range(11)
        ]

    def get_round_key(self, round_index: int) -> list[list[int]]:
        """Return a defensive copy of a round key."""
        if not 0 <= round_index <= 10:
            raise ValueError('AES-128 round must be between 0 and 10.')
        return [row[:] for row in self.round_keys[round_index]]

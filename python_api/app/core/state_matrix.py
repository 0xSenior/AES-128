"""The 4x4 AES state and its transformations."""

from app.constants import INV_MIX_COLUMNS, MIX_COLUMNS
from app.core.galois_field import multiply
from app.core.s_box import SBox


class StateMatrix:
    """Represent an AES state as four rows of four bytes."""

    def __init__(self, data: list[list[int]] | None = None) -> None:
        candidate = data if data is not None else [[0] * 4 for _ in range(4)]
        self._validate(candidate)
        self.data = [row[:] for row in candidate]

    def sub_bytes(self) -> "StateMatrix":
        """Apply the forward S-box to every byte."""
        self.data = [[SBox.substitute(byte) for byte in row] for row in self.data]
        return self

    def inverse_sub_bytes(self) -> "StateMatrix":
        """Apply the inverse S-box to every byte."""
        self.data = [[SBox.inverse_substitute(byte) for byte in row] for row in self.data]
        return self

    def shift_rows(self) -> "StateMatrix":
        """Rotate row n left by n positions."""
        self.data = [row[index:] + row[:index] for index, row in enumerate(self.data)]
        return self

    def inverse_shift_rows(self) -> "StateMatrix":
        """Rotate row n right by n positions."""
        self.data = [row[4 - index:] + row[:4 - index] for index, row in enumerate(self.data)]
        return self

    def mix_columns(self) -> "StateMatrix":
        """Apply the forward MixColumns transformation."""
        return self._mix(MIX_COLUMNS)

    def inverse_mix_columns(self) -> "StateMatrix":
        """Apply the inverse MixColumns transformation."""
        return self._mix(INV_MIX_COLUMNS)

    def add_round_key(self, key: list[list[int]]) -> "StateMatrix":
        """XOR this state with a 4x4 round key."""
        self._validate(key)
        self.data = [[byte ^ key[row][column] for column, byte in enumerate(values)] for row, values in enumerate(self.data)]
        return self

    def _mix(self, matrix: tuple[tuple[int, ...], ...]) -> "StateMatrix":
        transformed = [[0] * 4 for _ in range(4)]
        for row in range(4):
            for column in range(4):
                for index in range(4):
                    transformed[row][column] ^= multiply(matrix[row][index], self.data[index][column])
        self.data = transformed
        return self

    @staticmethod
    def _validate(data: list[list[int]]) -> None:
        if len(data) != 4 or any(len(row) != 4 for row in data):
            raise ValueError('State must be a 4x4 matrix.')
        if any(byte < 0 or byte > 255 for row in data for byte in row):
            raise ValueError('State values must be bytes from 0 to 255.')
